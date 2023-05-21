import { QueryResult, QueryResultHeader } from 'types/SqlResult';
import { DatabaseSchema } from 'types/SqlSchema';
import { ResultChangeCollectorItem } from './ResultChangeCollector';
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
function getUpdatableTable(
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

function getSqlPlanFromChange(
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
            where: updatable[tableName].reduce((a, b) => {
              return {
                ...a,
                [b.columnNames]: data.rows[change.row][b.columnNumber],
              };
            }, {}),
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
  changes: ResultChangeCollectorItem[]
): SqlStatementPlan[] {
  const updatableTables = getUpdatableTable(currentData.headers, schema);

  // Prepare the statement plans
  let plans: SqlStatementPlan[] = [];
  for (const change of changes) {
    plans = [
      ...plans,
      ...getSqlPlanFromChange(change, currentData, updatableTables),
    ];
  }

  return plans;
}
