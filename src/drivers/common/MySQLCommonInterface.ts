import {
  DatabaseSchemas,
  TableConstraintTypeSchema,
  TableDefinitionSchema,
} from 'types/SqlSchema';
import SQLCommonInterface from './SQLCommonInterface';
import { SqlRunnerManager } from 'libs/SqlRunnerManager';
import { qb } from 'libs/QueryBuilder';

export default class MySQLCommonInterface extends SQLCommonInterface {
  protected runner: SqlRunnerManager;
  protected currentDatabaseName?: string;

  constructor(executor: SqlRunnerManager, currentDatabaseName?: string) {
    super();
    this.runner = executor;
    this.currentDatabaseName = currentDatabaseName;
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
    const data = response[0].result;
    const constraints = response[1].result;
    const tableDict: Record<
      string,
      Record<string, string>
    > = response[2].result.rows.reduce(
      (a: Record<string, Record<string, string>>, row) => {
        const databaseName = row[0] as string;
        const tableName = row[1] as string;
        const tableType = row[2] as string;

        if (a[databaseName]) {
          a[databaseName][tableName] = tableType;
        } else {
          a[databaseName] = { [tableName]: tableType };
        }

        return a;
      },
      {}
    );

    const events = response[4].result.rows;
    const trigger = response[3].result.rows;

    for (const row of data.rows) {
      const databaseName = row[0] as string;
      const tableName = row[1] as string;
      const columnName = row[2] as string;

      if (!databases[databaseName]) {
        databases[databaseName] = {
          tables: {},
          name: databaseName,
          events: events
            .filter((row) => row[0] === databaseName)
            .map((row) => row[1] as string),
          triggers: trigger
            .filter((row) => row[0] === databaseName)
            .map((row) => row[1] as string),
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
      const constraintName = row[1] as string;
      const tableSchema = row[2] as string;
      const tableName = row[3] as string;
      const constraintType = row[5] as string;
      const columnName = row[4] as string;

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

    const columns = response[0].result.rows as [
      string,
      string,
      string,
      string,
      string,
      string,
      number | null,
      number | null,
      number | null,
      string | null
    ][];

    return {
      name: table,
      columns: columns.map((col) => ({
        name: col[2],
        dataType: col[3],
        nullable: col[4] === 'YES',
        comment: col[5],
        charLength: col[6],
        nuermicPrecision: col[7],
        numericScale: col[8],
        default: col[9],
      })),
      createSql: '',
    };
  }
}
