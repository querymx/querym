import { SqlQueryCallback } from 'drivers/SQLLikeConnection';
import { QueryResult } from 'types/SqlResult';
import { SqlStatement } from 'types/SqlStatement';

export enum SqlProtectionLevel {
  None = 0,
  NeedConfirm = 1,
}

export type BeforeAllEventCallback = (
  level: SqlProtectionLevel,
  statements: SqlStatement[]
) => Promise<boolean>;

export type BeforeEachEventCallback = (
  level: SqlProtectionLevel,
  statements: SqlStatement
) => Promise<boolean>;

export interface SqlStatementResult {
  statement: SqlStatement;
  result: QueryResult;
}

export class SqlRunnerManager {
  protected executor: SqlQueryCallback;
  protected beforeAllCallbacks: BeforeAllEventCallback[] = [];
  protected beforeEachCallbacks: BeforeEachEventCallback[] = [];

  constructor(executor: SqlQueryCallback) {
    this.executor = executor;
  }

  async execute(
    level: SqlProtectionLevel,
    statements: SqlStatement[]
  ): Promise<SqlStatementResult[]> {
    const result: SqlStatementResult[] = [];

    for (const cb of this.beforeAllCallbacks) {
      if (!(await cb(level, statements))) {
        throw 'Cancel';
      }
    }

    for (const statement of statements) {
      for (const cb of this.beforeEachCallbacks) {
        if (!(await cb(level, statement))) {
          throw 'Cancel';
        }
      }

      const returnedResult = await this.executor(
        statement.sql,
        statement.params
      );

      if (!returnedResult?.error) {
        result.push({
          statement,
          result: returnedResult,
        });
      } else {
        throw returnedResult.error;
      }
    }

    return result;
  }

  registerBeforeAll(cb: BeforeAllEventCallback) {
    this.beforeAllCallbacks.push(cb);
  }

  unregisterBeforeAll(cb: BeforeAllEventCallback) {
    this.beforeAllCallbacks = this.beforeAllCallbacks.filter(
      (prevCb) => prevCb !== cb
    );
  }

  registerBeforeEach(cb: BeforeEachEventCallback) {
    this.beforeEachCallbacks.push(cb);
  }

  unregisterBeforeEach(cb: BeforeEachEventCallback) {
    this.beforeEachCallbacks = this.beforeEachCallbacks.filter(
      (prevCb) => prevCb !== cb
    );
  }
}
