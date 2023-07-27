import { DatabaseSchemas } from 'types/SqlSchema';
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
