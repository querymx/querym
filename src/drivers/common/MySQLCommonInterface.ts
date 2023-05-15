import { DatabaseSchemas } from 'drivers/SQLLikeConnection';
import SQLCommonInterface from './SQLCommonInterface';
import { SqlProtectionLevel, SqlRunnerManager } from 'libs/SqlRunnerManager';

export default class MySQLCommonInterface extends SQLCommonInterface {
  protected runner: SqlRunnerManager;
  protected currentDatabaseName?: string;

  constructor(executor: SqlRunnerManager, currentDatabaseName?: string) {
    super();
    this.runner = executor;
    this.currentDatabaseName = currentDatabaseName;
  }

  async getSchema(): Promise<DatabaseSchemas> {
    const response = await this.runner.execute(SqlProtectionLevel.None, [
      {
        sql: this.currentDatabaseName
          ? `SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=:database_name`
          : `SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS`,
        params: this.currentDatabaseName
          ? { database_name: this.currentDatabaseName }
          : undefined,
      },
    ]);

    const databases: DatabaseSchemas = {};
    const data = response[0].result;

    for (const column of data.rows) {
      const databaseName = column[0] as string;
      const tableName = column[1] as string;
      const columnName = column[2] as string;

      if (!databases[databaseName]) {
        databases[databaseName] = {
          tables: {},
          name: databaseName,
        };
      }

      const database = databases[databaseName];
      if (!database.tables[tableName]) {
        database.tables[tableName] = {
          name: tableName,
          columns: {},
        };
      }

      const table = database.tables[tableName];
      table.columns[columnName] = { name: columnName };
    }

    return databases;
  }
}
