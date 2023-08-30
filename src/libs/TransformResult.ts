import { DatabaseSchemas, TableColumnSchema } from 'types/SqlSchema';
import { SqlStatementResult } from './SqlRunnerManager';
import { QueryResultHeader } from 'types/SqlResult';

function findMatchColumn(
  schema: DatabaseSchemas,
  header: QueryResultHeader
): QueryResultHeader {
  if (!header.schema?.database) return header;
  const matchedSchema = schema[header.schema.database];
  if (!matchedSchema) return header;

  if (!header.schema.table) return header;
  const matchedTable = matchedSchema.tables[header.schema.table];
  if (!matchedTable) return header;

  if (!header.schema.column) return header;
  const matchedColumn = matchedTable.columns[header.schema.column];
  if (!matchedColumn) return header;

  return {
    ...header,
    columnDefinition: matchedColumn,
  };
}

export function transformResultHeaderUseSchema(
  statements: SqlStatementResult[],
  schema: DatabaseSchemas | undefined
): SqlStatementResult[] {
  if (!schema) return statements;

  return statements.map((statement) => {
    return {
      ...statement,
      result: {
        ...statement.result,
        headers: statement.result.headers.map((header) =>
          findMatchColumn(schema, header)
        ),
      },
    };
  });
}

/**
 * Sometimes the result from database cannot be easily
 * converted to string or number. This function looks at
 * the data type of column and transform it to friendly
 * displayable string
 *
 * @param value
 * @param header
 * @returns
 */
export function getDisplayableFromDatabaseValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  header?: TableColumnSchema
) {
  if (value === null) return null;
  if (value === undefined) return undefined;

  try {
    if (!header) return value.toString();

    if (header.dataType === 'geometry') {
      return JSON.stringify(value as object);
    }

    return value.toString();
  } catch {
    return '';
  }
}

/**
 * Turn the whole result into friendly-string
 *
 * @param rows
 * @param headers
 * @returns
 */
export function getDisplayableFromDatabaseRows(
  rows: Record<string, unknown>[],
  headers: QueryResultHeader[]
): Record<string, unknown>[] {
  return rows.map((row) => {
    return headers.reduce<Record<string, unknown>>((acc, cur) => {
      acc[cur.name] = getDisplayableFromDatabaseValue(
        row[cur.name],
        cur.columnDefinition
      );
      return acc;
    }, {});
  });
}
