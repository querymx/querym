import { SqlQueryCallback } from 'drivers/base/SQLLikeConnection';
import { QueryResult } from 'types/SqlResult';
import { SqlStatement } from 'types/SqlStatement';
import { Parser, AST } from 'node-sql-parser';

export interface SqlStatementWithAnalyze extends SqlStatement {
  analyze?: AST;
}

export type BeforeAllEventCallback = (
  statements: SqlStatementWithAnalyze[],
  skipProtection?: boolean,
) => Promise<boolean>;

export type BeforeEachEventCallback = (
  statements: SqlStatementWithAnalyze,
  skipProtection?: boolean,
) => Promise<boolean>;

export interface SqlStatementResult<ResultType = QueryResult> {
  statement: SqlStatement;
  time: number;
  result: ResultType;
}

interface SqlExecuteOption {
  onStart?: () => void;
  skipProtection?: boolean;
  disableAnalyze?: boolean;
  insideTransaction?: boolean;
}

export class SqlRunnerManager {
  protected executor: SqlQueryCallback;
  protected beforeAllCallbacks: BeforeAllEventCallback[] = [];
  protected beforeEachCallbacks: BeforeEachEventCallback[] = [];

  constructor(executor: SqlQueryCallback) {
    this.executor = executor;
  }

  async execute(
    statements: SqlStatement[],
    options?: SqlExecuteOption,
  ): Promise<SqlStatementResult[]> {
    const result: SqlStatementResult[] = [];
    const parser = new Parser();

    // We only wrap transaction if it is multiple statement and
    // insideTransactin is specified. Single statement, by itself, is
    // transactional already.
    const shouldStartTransaction =
      !!options?.insideTransaction && statements.length > 1;

    const finalStatements: SqlStatementWithAnalyze[] = options?.disableAnalyze
      ? statements
      : statements.map((statement) => {
          try {
            return {
              ...statement,
              analyze: parser.astify(statement.sql),
            };
          } catch (e) {
            console.error(e);
          }

          return statement;
        });

    for (const cb of this.beforeAllCallbacks) {
      if (!(await cb(finalStatements, options?.skipProtection))) {
        throw 'Cancel';
      }
    }

    try {
      if (shouldStartTransaction) await this.executor('START TRANSACTION;');
      for (const statement of finalStatements) {
        for (const cb of this.beforeEachCallbacks) {
          if (!(await cb(statement, options?.skipProtection))) {
            throw 'Cancel';
          }
        }

        if (options?.onStart) options.onStart();

        const startTime = Date.now();
        const returnedResult = await this.executor(
          statement.sql,
          statement.params,
        );

        if (!returnedResult?.error) {
          result.push({
            statement,
            time: Date.now() - startTime,
            result: returnedResult,
          });
        } else {
          throw returnedResult.error;
        }
      }

      if (shouldStartTransaction) await this.executor('COMMIT;');
      return result;
    } catch (e) {
      if (shouldStartTransaction) await this.executor('ROLLBACK;');
      throw e;
    }
  }

  registerBeforeAll(cb: BeforeAllEventCallback) {
    this.beforeAllCallbacks.push(cb);
  }

  unregisterBeforeAll(cb: BeforeAllEventCallback) {
    this.beforeAllCallbacks = this.beforeAllCallbacks.filter(
      (prevCb) => prevCb !== cb,
    );
  }

  registerBeforeEach(cb: BeforeEachEventCallback) {
    this.beforeEachCallbacks.push(cb);
  }

  unregisterBeforeEach(cb: BeforeEachEventCallback) {
    this.beforeEachCallbacks = this.beforeEachCallbacks.filter(
      (prevCb) => prevCb !== cb,
    );
  }
}
