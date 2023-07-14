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
