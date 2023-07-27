import { QueryResult, QueryResultHeader } from 'types/SqlResult';
import { DatabaseSchema } from 'types/SqlSchema';
import {
  ResultChangeCollectorItem,
  ResultChanges,
} from './ResultChangeCollector';
import { SqlStatementPlan } from 'types/SqlStatement';

type UpdatableTableDict = Record<
  string,
  { columnNames: string; columnNumber: number }[]
>;

/**
 * Based on the query headers and schema, we decide which
 * table has enough information to make it updatable.
 *
 * @param headers
 * @param schema
 * @returns
 */
export function getUpdatableTable(
  headers: QueryResultHeader[],
  schema: DatabaseSchema
): UpdatableTableDict {
  const result: UpdatableTableDict = {};

  // Get unique tables
  const uniqueTableNames = new Set(
    headers
      .filter((header) => !!header.schema?.table)
      .map((header) => header.schema?.table || '')
  );

  // For each tables, let check if we have enough column for update
  for (const tableName of uniqueTableNames) {
    const schemaTable = schema.tables[tableName];

    if (schemaTable) {
      const tableFoundKeys: { columnNames: string; columnNumber: number }[] =
        [];
      const tablePrimaryKeys = schemaTable.primaryKey;

      if (tablePrimaryKeys.length <= 0) continue;

      for (const tablePk of tablePrimaryKeys) {
        const columnIndex = headers.findIndex(
          (header) =>
            header.schema?.table === tableName &&
            header?.schema?.column === tablePk
        );

        if (columnIndex >= 0) {
          tableFoundKeys.push({
            columnNames: tablePk,
            columnNumber: columnIndex,
          });
        }
      }

      if (tableFoundKeys.length === tablePrimaryKeys.length) {
        result[tableName] = tableFoundKeys;
      }
    }
  }

  return result;
}

function buildWhere(
  tableName: string,
  rowIndex: number,
  data: QueryResult,
  updatable: UpdatableTableDict
): Record<string, unknown> {
  const rows = data.rows;
  const headers = data.headers;

  return updatable[tableName].reduce((a, b) => {
    return {
      ...a,
      [b.columnNames]: rows[rowIndex][headers[b.columnNumber].name],
    };
  }, {});
}

function buildRemovePlan(
  removeIndex: number,
  data: QueryResult,
  updatable: UpdatableTableDict
): SqlStatementPlan[] {
  // We will not remove if there is more than one table inside the result
  const entries = Object.entries(updatable);
  if (entries.length === 0) return [];
  if (entries.length > 1) return [];

  const [tableName] = entries[0];
  return [
    {
      type: 'delete',
      table: tableName,
      where: buildWhere(tableName, removeIndex, data, updatable),
    },
  ];
}

function buildInsertPlan(
  changes: ResultChangeCollectorItem,
  headers: QueryResultHeader[]
): SqlStatementPlan[] {
  const values: Record<string, unknown> = {};

  const uniqueTable = new Set(
    headers
      .filter((header) => header.schema)
      .map((header) => header.schema?.table)
  );
  if (uniqueTable.size > 1) return [];

  for (const { col, value } of changes.cols) {
    values[headers[col].name] = value;
  }

  return [{ type: 'insert', table: Array.from(uniqueTable)[0] ?? '', values }];
}

function buildUpdatePlan(
  change: ResultChangeCollectorItem,
  data: QueryResult,
  updatable: UpdatableTableDict
): SqlStatementPlan[] {
  const changedTable: Record<string, SqlStatementPlan> = {};
  const headers = data.headers;

  for (const col of change.cols) {
    const header = headers[col.col];
    if (header && header.schema) {
      const tableName = header.schema.table;
      if (tableName && updatable[tableName]) {
        if (changedTable[tableName]) {
          changedTable[tableName].values = {
            ...changedTable[tableName].values,
            [header.name]: col.value,
          };
        } else {
          changedTable[tableName] = {
            table: tableName,
            type: 'update',
            values: {
              [header.name]: col.value,
            },
            where: buildWhere(tableName, change.row, data, updatable),
          };
        }
      }
    }
  }

  return Object.values(changedTable);
}

export default function generateSqlFromChanges(
  schema: DatabaseSchema,
  currentData: QueryResult,
  changes: ResultChanges
): SqlStatementPlan[] {
  const updatableTables = getUpdatableTable(currentData.headers, schema);

  // Prepare the statement plans
  let plans: SqlStatementPlan[] = [];

  for (const change of changes.changes) {
    plans = [
      ...plans,
      ...buildUpdatePlan(change, currentData, updatableTables),
    ];
  }

  for (const removeIndex of changes.remove) {
    plans = [
      ...plans,
      ...buildRemovePlan(removeIndex, currentData, updatableTables),
    ];
  }

  for (const change of changes.new) {
    plans = [...plans, ...buildInsertPlan(change, currentData.headers)];
  }

  return plans;
}
