import {
  DatabaseSchemas,
  TableConstraintTypeSchema,
  TableDefinitionSchema,
} from 'types/SqlSchema';
import SQLCommonInterface from './SQLCommonInterface';
import { SqlRunnerManager } from 'libs/SqlRunnerManager';
import { qb } from 'libs/QueryBuilder';
import { QueryResult } from 'types/SqlResult';

export default class MySQLCommonInterface extends SQLCommonInterface {
  protected runner: SqlRunnerManager;
  protected currentDatabaseName?: string;

  constructor(executor: SqlRunnerManager, currentDatabaseName?: string) {
    super();
    this.runner = executor;
    this.currentDatabaseName = currentDatabaseName;
  }

  async switchDatabase(databaseName: string): Promise<boolean> {
    const response = await this.runner.execute(
      [{ sql: 'USE ' + qb().escapeId(databaseName) }],
      {
        skipProtection: true,
      }
    );

    if (response[0].result.error) {
      return false;
    }

    return true;
  }

  async getSchema(): Promise<DatabaseSchemas> {
    const response = await this.runner.execute(
      [
        {
          sql: qb()
            .table('information_schema.columns')
            .select('table_schema', 'table_name', 'column_name')
            .where({ table_schema: this.currentDatabaseName })
            .toRawSQL(),
        },
        {
          sql: 'SELECT kc.CONSTRAINT_SCHEMA, kc.CONSTRAINT_NAME, kc.TABLE_SCHEMA, kc.TABLE_NAME, kc.COLUMN_NAME, tc.CONSTRAINT_TYPE FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kc INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc ON (kc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME AND kc.TABLE_NAME = tc.TABLE_NAME AND kc.TABLE_SCHEMA = tc.TABLE_SCHEMA)',
        },
        {
          sql: qb()
            .table('information_schema.tables')
            .select('table_schema', 'table_name', 'table_type')
            .where({ table_schema: this.currentDatabaseName })
            .toRawSQL(),
        },
        {
          sql: qb()
            .table('information_schema.triggers')
            .select('trigger_schema', 'trigger_name')
            .where({ trigger_schema: this.currentDatabaseName })
            .toRawSQL(),
        },
        {
          sql: qb()
            .table('information_schema.events')
            .select('event_schema', 'event_name')
            .where({ event_schema: this.currentDatabaseName })
            .toRawSQL(),
        },
      ],
      {
        disableAnalyze: true,
        skipProtection: true,
      }
    );

    const databases: DatabaseSchemas = {};
    const data = response[0].result as QueryResult<{
      TABLE_SCHEMA: string;
      TABLE_NAME: string;
      COLUMN_NAME: string;
    }>;

    const constraints = response[1].result as QueryResult<{
      CONSTRAINT_SCHEMA: string;
      CONSTRAINT_NAME: string;
      TABLE_SCHEMA: string;
      TABLE_NAME: string;
      COLUMN_NAME: string;
      CONSTRAINT_TYPE: string;
    }>;

    const tableDict: Record<string, Record<string, string>> = (
      response[2].result as QueryResult<{
        TABLE_SCHEMA: string;
        TABLE_NAME: string;
        TABLE_TYPE: string;
      }>
    ).rows.reduce((a: Record<string, Record<string, string>>, row) => {
      const databaseName = row.TABLE_SCHEMA;
      const tableName = row.TABLE_NAME;
      const tableType = row.TABLE_TYPE;

      if (a[databaseName]) {
        a[databaseName][tableName] = tableType;
      } else {
        a[databaseName] = { [tableName]: tableType };
      }

      return a;
    }, {});

    const events = (
      response[4].result as QueryResult<{
        EVENT_SCHEMA: string;
        EVENT_NAME: string;
      }>
    ).rows;

    const trigger = (
      response[3].result as QueryResult<{
        TRIGGER_SCHEMA: string;
        TRIGGER_NAME: string;
      }>
    ).rows;

    console.log(data.rows);

    for (const row of data.rows) {
      const databaseName = row.TABLE_SCHEMA;
      const tableName = row.TABLE_NAME;
      const columnName = row.COLUMN_NAME;

      if (!databases[databaseName]) {
        databases[databaseName] = {
          tables: {},
          name: databaseName,
          events: events
            .filter((row) => row.EVENT_SCHEMA === databaseName)
            .map((row) => row.EVENT_NAME),
          triggers: trigger
            .filter((row) => row.TRIGGER_SCHEMA === databaseName)
            .map((row) => row.TRIGGER_NAME),
        };
      }

      const database = databases[databaseName];
      if (!database.tables[tableName]) {
        database.tables[tableName] = {
          type:
            tableDict[databaseName][tableName] === 'VIEW' ? 'VIEW' : 'TABLE',
          name: tableName,
          columns: {},
          constraints: [],
          primaryKey: [],
        };
      }

      const table = database.tables[tableName];
      table.columns[columnName] = { name: columnName };
    }

    for (const row of constraints.rows) {
      const constraintName = row.CONSTRAINT_NAME;
      const tableSchema = row.TABLE_SCHEMA;
      const tableName = row.TABLE_NAME;
      const constraintType = row.CONSTRAINT_TYPE;
      const columnName = row.COLUMN_NAME;

      if (databases[tableSchema]) {
        const database = databases[tableSchema];
        if (database.tables[tableName]) {
          const table = database.tables[tableName];
          if (constraintType === 'PRIMARY KEY') {
            table.primaryKey.push(columnName);
          }

          const constraintFound = table.constraints.find(
            (constraint) => constraint.name === constraintName
          );
          if (constraintFound) {
            constraintFound.columns.push(columnName);
          } else {
            table.constraints.push({
              columns: [columnName],
              name: constraintName,
              type: constraintType as TableConstraintTypeSchema,
            });
          }
        }
      }
    }

    return databases;
  }

  async getTableSchema(table: string): Promise<TableDefinitionSchema> {
    const response = await this.runner.execute(
      [
        {
          sql: qb()
            .table('information_schema.columns')
            .select(
              'table_schema',
              'table_name',
              'column_name',
              'data_type',
              'is_nullable',
              'column_comment',
              'character_maximum_length',
              'numeric_precision',
              'numeric_scale',
              'column_default'
            )
            .where({
              table_schema: this.currentDatabaseName,
              table_name: table,
            })
            .toRawSQL(),
        },
      ],
      {
        disableAnalyze: true,
        skipProtection: true,
      }
    );

    const columns = response[0].result.rows as {
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: 'YES' | 'NO';
      column_comment: string;
      character_maximum_length: number;
      numeric_precision: number;
      numeric_scale: number;
      column_default: string;
    }[];

    return {
      name: table,
      columns: columns.map((col) => ({
        name: col.column_name,
        dataType: col.data_type,
        nullable: col.is_nullable === 'YES',
        comment: col.column_comment,
        charLength: col.character_maximum_length,
        nuermicPrecision: col.numeric_precision,
        numericScale: col.numeric_scale,
        default: col.column_default,
      })),
      createSql: '',
    };
  }
}
