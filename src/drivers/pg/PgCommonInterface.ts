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
    const schemas = await this.singleExecute<{ schema_name: string }>(sql);

    // Get all schemas
    const result: DatabaseSchemas = schemas.rows
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

    // Map each tables to correct schemas
    const tables = await this.singleExecute<{
      table_schema: string;
      table_name: string;
      table_type: string;
    }>(
      `SELECT table_schema, "table_name", table_type FROM information_schema.tables;`
    );

    for (const table of tables.rows) {
      if (result[table.table_schema]) {
        result[table.table_schema].tables[table.table_name] = {
          columns: {},
          constraints: [],
          name: table.table_name,
          primaryKey: [],
          type: table.table_type === 'BASE_TABLE' ? 'TABLE' : 'VIEW',
        };
      }
    }

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
