import { DatabaseSchemas, TableDefinitionSchema } from 'types/SqlSchema';
import SQLCommonInterface from './../base/SQLCommonInterface';
import { SqlRunnerManager } from 'libs/SqlRunnerManager';
import { QueryResult } from 'types/SqlResult';

export default class PgCommonInterface extends SQLCommonInterface {
  protected runner: SqlRunnerManager;
  protected currentDatabaseName?: string;

  constructor(executor: SqlRunnerManager, currentDatabaseName?: string) {
    super();
    this.runner = executor;
    this.currentDatabaseName = currentDatabaseName;
  }

  async singleExecute<T = unknown>(sql: string) {
    const response = await this.runner.execute([{ sql }], {
      disableAnalyze: true,
      skipProtection: true,
    });

    return response[0].result as QueryResult<T>;
  }

  async getSchema(): Promise<DatabaseSchemas> {
    const sql = 'SELECT schema_name FROM information_schema.schemata';
    const r = await this.singleExecute<{ schema_name: string }>(sql);

    const result: DatabaseSchemas = r.rows
      .map((row) => row.schema_name)
      .reduce((a, b) => {
        a[b] = {
          name: b,
          events: [],
          tables: {},
          triggers: [],
        };
        return a;
      }, {} as DatabaseSchemas);

    return result;
  }

  async getTableSchema(): Promise<TableDefinitionSchema> {
    throw new Error('Not implemented');
  }

  async switchDatabase(): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async getVersion(): Promise<string> {
    throw new Error('Not implemented');
  }

  async estimateTableRowCount(): Promise<number | null> {
    throw new Error('Not implemented');
  }
}
