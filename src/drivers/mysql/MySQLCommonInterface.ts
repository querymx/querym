import {
  DatabaseSchemas,
  TableConstraintTypeSchema,
  TableDefinitionSchema,
  TableColumnSchema,
} from 'types/SqlSchema';
import SQLCommonInterface from '../base/SQLCommonInterface';
import { SqlRunnerManager } from 'libs/SqlRunnerManager';
import { qb } from 'libs/QueryBuilder';
import { QueryResult } from 'types/SqlResult';
import { parseEnumType } from 'libs/ParseColumnType';

interface MySqlDatabase {
  SCHEMA_NAME: string;
}

interface MySqlColumn {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: 'YES' | 'NO';
  COLUMN_COMMENT: string;
  CHARACTER_MAXIMUM_LENGTH: number;
  NUMERIC_PRECISION: number;
  NUMERIC_SCALE: number;
  COLUMN_DEFAULT: string;
  COLUMN_TYPE: string;
}

interface MySqlTable {
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  TABLE_TYPE: string;
}

interface MySqlTrigger {
  TRIGGER_SCHEMA: string;
  TRIGGER_NAME: string;
}

interface MySqlEvent {
  EVENT_SCHEMA: string;
  EVENT_NAME: string;
}

interface MySqlConstraint {
  CONSTRAINT_SCHEMA: string;
  CONSTRAINT_NAME: string;
  TABLE_SCHEMA: string;
  TABLE_NAME: string;
  COLUMN_NAME: string;
  CONSTRAINT_TYPE: string;
}

function mapColumnDefinition(col: MySqlColumn): TableColumnSchema {
  return {
    name: col.COLUMN_NAME,
    dataType: col.DATA_TYPE,
    nullable: col.IS_NULLABLE === 'YES',
    comment: col.COLUMN_COMMENT,
    charLength: col.CHARACTER_MAXIMUM_LENGTH,
    nuermicPrecision: col.NUMERIC_PRECISION,
    numericScale: col.NUMERIC_SCALE,
    default: col.COLUMN_DEFAULT,
    enumValues: col.DATA_TYPE === 'enum' ? parseEnumType(col.COLUMN_TYPE) : [],
  };
}

export function buildDatabaseSchemaFrom(
  databases: MySqlDatabase[],
  tables: MySqlTable[],
  columns: MySqlColumn[],
  events: MySqlEvent[],
  triggers: MySqlTrigger[],
  constraints: MySqlConstraint[]
): DatabaseSchemas {
  const tableDict: Record<string, Record<string, string>> = tables.reduce(
    (a: Record<string, Record<string, string>>, row) => {
      const databaseName = row.TABLE_SCHEMA;
      const tableName = row.TABLE_NAME;
      const tableType = row.TABLE_TYPE;

      if (a[databaseName]) {
        a[databaseName][tableName] = tableType;
      } else {
        a[databaseName] = { [tableName]: tableType };
      }

      return a;
    },
    {}
  );

  const schemas: DatabaseSchemas = databases.reduce((prev, { SCHEMA_NAME }) => {
    const currentTriggers = triggers
      .filter((row) => row.TRIGGER_SCHEMA === SCHEMA_NAME)
      .map((row) => row.TRIGGER_NAME);

    const currentEvents = events
      .filter((row) => row.EVENT_SCHEMA === SCHEMA_NAME)
      .map((row) => row.EVENT_NAME);

    return {
      ...prev,
      [SCHEMA_NAME]: {
        name: SCHEMA_NAME,
        tables: {},
        events: currentEvents,
        triggers: currentTriggers,
      },
    };
  }, {});

  for (const row of columns) {
    const databaseName = row.TABLE_SCHEMA;
    const tableName = row.TABLE_NAME;
    const columnName = row.COLUMN_NAME;

    const database = schemas[databaseName];
    if (!database.tables[tableName]) {
      database.tables[tableName] = {
        type: tableDict[databaseName][tableName] === 'VIEW' ? 'VIEW' : 'TABLE',
        name: tableName,
        columns: {},
        constraints: [],
        primaryKey: [],
      };
    }

    const table = database.tables[tableName];
    table.columns[columnName] = mapColumnDefinition(row);
  }

  for (const row of constraints) {
    const constraintName = row.CONSTRAINT_NAME;
    const tableSchema = row.TABLE_SCHEMA;
    const tableName = row.TABLE_NAME;
    const constraintType = row.CONSTRAINT_TYPE;
    const columnName = row.COLUMN_NAME;

    if (schemas[tableSchema]) {
      const database = schemas[tableSchema];
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

  return schemas;
}

export default class MySQLCommonInterface extends SQLCommonInterface {
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

  async getVersion(): Promise<string> {
    const response = await this.singleExecute<{ 'VERSION()': string }>(
      'SELECT VERSION();'
    );
    return response.rows[0]['VERSION()'];
  }

  async getSchema(): Promise<DatabaseSchemas> {
    const databaseListResponse = await this.singleExecute<MySqlDatabase>(
      qb().table('information_schema.SCHEMATA').select('SCHEMA_NAME').toRawSQL()
    );

    const tableListResponse = await this.singleExecute<MySqlTable>(
      qb()
        .table('information_schema.tables')
        .select('TABLE_SCHEMA', 'TABLE_NAME', 'TABLE_TYPE')
        .toRawSQL()
    );

    const columnListResponse = await this.singleExecute<MySqlColumn>(
      qb()
        .table('information_schema.columns')
        .select(
          'TABLE_SCHEMA',
          'TABLE_NAME',
          'COLUMN_NAME',
          'DATA_TYPE',
          'IS_NULLABLE',
          'COLUMN_COMMENT',
          'CHARACTER_MAXIMUM_LENGTH',
          'NUMERIC_PRECISION',
          'NUMERIC_SCALE',
          'COLUMN_DEFAULT',
          'COLUMN_TYPE'
        )
        .toRawSQL()
    );

    const triggerListResponse = await this.singleExecute<MySqlTrigger>(
      qb()
        .table('information_schema.triggers')
        .select('TRIGGER_SCHEMA', 'TRIGGER_NAME')
        .toRawSQL()
    );

    const eventListResponse = await this.singleExecute<MySqlEvent>(
      qb()
        .table('information_schema.events')
        .select('EVENT_SCHEMA', 'EVENT_NAME')
        .toRawSQL()
    );

    const constraintListResponse = await this.singleExecute<MySqlConstraint>(
      'SELECT kc.CONSTRAINT_SCHEMA, kc.CONSTRAINT_NAME, kc.TABLE_SCHEMA, kc.TABLE_NAME, kc.COLUMN_NAME, tc.CONSTRAINT_TYPE FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kc INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc ON (kc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME AND kc.TABLE_NAME = tc.TABLE_NAME AND kc.TABLE_SCHEMA = tc.TABLE_SCHEMA)'
    );

    return buildDatabaseSchemaFrom(
      databaseListResponse.rows,
      tableListResponse.rows,
      columnListResponse.rows,
      eventListResponse.rows,
      triggerListResponse.rows,
      constraintListResponse.rows
    );
  }

  async getTableSchema(
    database: string,
    table: string
  ): Promise<TableDefinitionSchema> {
    const response = await this.runner.execute(
      [
        {
          sql: qb()
            .table('information_schema.columns')
            .select(
              'TABLE_SCHEMA',
              'TABLE_NAME',
              'COLUMN_NAME',
              'DATA_TYPE',
              'IS_NULLABLE',
              'COLUMN_COMMENT',
              'CHARACTER_MAXIMUM_LENGTH',
              'NUMERIC_PRECISION',
              'NUMERIC_SCALE',
              'COLUMN_DEFAULT',
              'COLUMN_TYPE'
            )
            .where({
              table_schema: database,
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

    const columns = (response[0].result as unknown as QueryResult<MySqlColumn>)
      .rows;

    return {
      name: table,
      columns: columns.map(mapColumnDefinition),
      createSql: '',
    };
  }
}
