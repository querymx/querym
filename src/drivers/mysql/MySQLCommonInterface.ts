import {
  DatabaseSchemas,
  TableConstraintTypeSchema,
  TableDefinitionSchema,
  TableColumnSchema,
  DatabaseSchemaList,
} from 'types/SqlSchema';
import SQLCommonInterface from '../base/SQLCommonInterface';
import { SqlRunnerManager, SqlStatementResult } from 'libs/SqlRunnerManager';
import { qb } from 'libs/QueryBuilder';
import { QueryResult, QueryResultHeader } from 'types/SqlResult';
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
    schemaName: col.TABLE_SCHEMA,
    tableName: col.TABLE_NAME,
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

function findMatchColumn(
  schema: DatabaseSchemaList,
  header: QueryResultHeader
): QueryResultHeader {
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
}

export function buildDatabaseSchemaFrom(
  databases: MySqlDatabase[],
  tables: MySqlTable[],
  columns: MySqlColumn[],
  events: MySqlEvent[],
  triggers: MySqlTrigger[],
  constraints: MySqlConstraint[]
): DatabaseSchemas {
  const schemas = new DatabaseSchemas();

  for (const db of databases) {
    schemas.addDatabase(db.SCHEMA_NAME);
  }

  for (const event of events) {
    schemas.addEvent(event.EVENT_SCHEMA, event.EVENT_NAME);
  }

  for (const trigger of triggers) {
    schemas.addTrigger(trigger.TRIGGER_SCHEMA, trigger.TRIGGER_NAME);
  }

  for (const table of tables) {
    schemas.addTable(table.TABLE_SCHEMA, {
      name: table.TABLE_NAME,
      type: table.TABLE_TYPE === 'VIEW' ? 'VIEW' : 'TABLE',
    });
  }

  for (const row of columns) {
    schemas.addColumn(
      row.TABLE_SCHEMA,
      row.TABLE_NAME,
      mapColumnDefinition(row)
    );
  }

  for (const row of constraints) {
    schemas.addConstraint(
      row.TABLE_SCHEMA,
      row.TABLE_NAME,
      row.CONSTRAINT_NAME,
      row.CONSTRAINT_TYPE as TableConstraintTypeSchema,
      row.COLUMN_NAME
    );

    if (row.CONSTRAINT_TYPE === 'PRIMARY KEY') {
      schemas.addPrimaryKey(row.TABLE_SCHEMA, row.TABLE_NAME, row.COLUMN_NAME);
    }
  }

  return schemas;
}

export default class MySQLCommonInterface extends SQLCommonInterface {
  public FLAG_USE_STATEMENT = true;

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

  async estimateTableRowCount(
    database: string,
    table: string
  ): Promise<number | null> {
    const sql = qb()
      .table(`information_schema.TABLES`)
      .select('TABLE_ROWS')
      .where({
        TABLE_SCHEMA: database,
        TABLE_NAME: table,
      })
      .toRawSQL();

    const result = await this.singleExecute<{ TABLE_ROWS: number }>(sql);
    const rows = result.rows;

    if (rows && rows.length === 1) {
      return Number(rows[0].TABLE_ROWS);
    }

    return null;
  }

  attachHeaders(
    statements: SqlStatementResult[],
    schema: DatabaseSchemas | undefined
  ): SqlStatementResult[] {
    if (!schema) return statements;
    const databaseList = schema.getSchema();

    return statements.map((statement) => {
      return {
        ...statement,
        result: {
          ...statement.result,
          headers: statement.result.headers.map((header) =>
            findMatchColumn(databaseList, header)
          ),
        },
      };
    });
  }
}
