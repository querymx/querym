import { DatabaseSchemas } from 'types/SqlSchema';
import {
  SqlStatementResult,
  SqlStatementRowBasedResult,
} from './SqlRunnerManager';

export function transformResultToRowBasedResult(
  statements: SqlStatementResult[]
): SqlStatementRowBasedResult[] {
  return statements.map((statement) => {
    const rows = statement.result.resultHeader
      ? []
      : statement.result.rows.map((row) =>
          statement.result.headers.map((header) => row[header.name])
        );

    return {
      ...statement,
      result: {
        ...statement.result,
        rows,
      },
    };
  });
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
        headers: statement.result.headers.map((header) => {
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
        }),
      },
    };
  });
}
