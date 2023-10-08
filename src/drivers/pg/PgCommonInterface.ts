import {
  DatabaseDataType,
  DatabaseSchemas,
  TableColumnSchema,
  TableDefinitionSchema,
} from 'types/SqlSchema';
import SQLCommonInterface from './../base/SQLCommonInterface';
import { SqlRunnerManager, SqlStatementResult } from 'libs/SqlRunnerManager';
import {
  QueryResult,
  QueryResultHeader,
  QueryResultHeaderType,
  QueryTypedResult,
} from 'types/SqlResult';
import { qb } from 'libs/QueryBuilder';
import DecimalType from 'renderer/datatype/DecimalType';
import NumberType from 'renderer/datatype/NumberType';
import StringType from 'renderer/datatype/StringType';
import JsonType from 'renderer/datatype/JsonType';
import BaseType from 'renderer/datatype/BaseType';
import PointType from 'renderer/datatype/PointType';

interface PgColumn {
  table_schema: string;
  table_name: string;
  column_name: string;
  ordinal_position: number;
  udt_name: string;
  is_nullable: string;
}

function mapColumnDefinition(col: PgColumn): TableColumnSchema {
  return {
    tableName: col.table_name,
    schemaName: col.table_schema,
    name: col.column_name,
    id: col.ordinal_position,
    charLength: 0,
    comment: '',
    dataType: col.udt_name,
    nullable: col.is_nullable === 'YES',
  };
}

function mapDataType(type?: DatabaseDataType): QueryResultHeaderType {
  if (!type) return { type: 'other' };

  // https://www.postgresql.org/docs/current/catalog-pg-type.html#CATALOG-TYPCATEGORY-TABLE
  const category = type.category.toUpperCase();
  if (['date'].includes(type.name)) return { type: 'string_date' };
  if (['time'].includes(type.name)) return { type: 'string_time' };
  if (['timestamp'].includes(type.name)) return { type: 'string_datetime' };
  if (['point'].includes(type.name)) return { type: 'point' };
  if (['regproc'].includes(type.name)) return { type: 'string' };
  if (category === 'S') return { type: 'string' };
  if (category === 'N') return { type: 'number' };
  return { type: 'other' };
}

export default class PgCommonInterface extends SQLCommonInterface {
  public FLAG_USE_STATEMENT = false;

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

    const result = new DatabaseSchemas();
    schemas.rows.forEach((schema) => result.addDatabase(schema.schema_name));

    // Map each tables to correct schemas
    const tables = await this.singleExecute<{
      oid: number;
      nspname: string;
      relname: string;
      relkind: string;
    }>(
      `SELECT pg_class.oid, relname, pg_namespace.nspname, pg_class.relkind FROM pg_class INNER JOIN pg_namespace ON (pg_class.relnamespace = pg_namespace.oid) WHERE pg_class.relkind IN ('r', 'v');`,
    );
    tables.rows.forEach((table) =>
      result.addTable(table.nspname, {
        name: table.relname,
        id: table.oid,
        type: table.relkind === 'r' ? 'TABLE' : 'VIEW',
      }),
    );

    // Map columns
    const columns = await this.singleExecute<{
      table_schema: string;
      table_name: string;
      column_name: string;
      ordinal_position: number;
      udt_name: string;
      is_nullable: string;
    }>(
      'SELECT table_schema, "table_name", "column_name", ordinal_position, udt_name, is_nullable FROM information_schema."columns";',
    );

    columns.rows.forEach((col) =>
      result.addColumn(
        col.table_schema,
        col.table_name,
        mapColumnDefinition(col),
      ),
    );

    // Map constraints
    const constraints = await this.singleExecute<{
      oid: number;
      conname: string;
      conrelid: number;
      contype: string;
      conkey: number[];
      nspname: string;
    }>(
      'SELECT pg_constraint.oid, conname, conrelid, contype, conkey, nspname FROM pg_constraint INNER JOIN pg_namespace ON (pg_constraint.connamespace = pg_namespace.oid);',
    );

    constraints.rows.forEach((constraint) => {
      const table = result.getTableById(constraint.conrelid);
      if (!table) return;

      Object.values(table.columns)
        .filter((col) => col.id && constraint.conkey.includes(col.id))
        .forEach((col) => {
          result.addConstraint(
            constraint.nspname,
            table.name,
            constraint.conname,
            constraint.contype === 'p' ? 'PRIMARY KEY' : 'UNIQUE',
            col.name,
          );

          if (constraint.contype === 'p') {
            result.addPrimaryKey(constraint.nspname, table.name, col.name);
          }
        });
    });

    // Map the type
    const types = await this.singleExecute<{
      oid: number;
      typname: string;
      typcategory: string;
    }>('SELECT oid, typname, typcategory FROM pg_type');
    types.rows.forEach((type) =>
      result.addType({
        id: type.oid,
        category: type.typcategory,
        name: type.typname,
      }),
    );

    return result;
  }

  async getTableSchema(
    database: string,
    table: string,
  ): Promise<TableDefinitionSchema> {
    const columns = await this.singleExecute<{
      table_schema: string;
      table_name: string;
      column_name: string;
      ordinal_position: number;
      udt_name: string;
      is_nullable: string;
    }>(
      qb('postgre')
        .table('information_schema.columns')
        .select(
          'table_schema',
          'table_name',
          'column_name',
          'ordinal_position',
          'udt_name',
          'is_nullable',
        )
        .where({
          table_schema: database,
          table_name: table,
        })
        .toRawSQL(),
    );

    return {
      createSql: '',
      name: table,
      columns: columns.rows.map((col) => mapColumnDefinition(col)),
    };
  }

  async switchDatabase(): Promise<boolean> {
    return true;
  }

  async getVersion(): Promise<string> {
    const sql = 'SHOW server_version;';
    const version = await this.singleExecute<{ server_version: string }>(sql);

    return version.rows[0].server_version;
  }

  async estimateTableRowCount(
    database: string,
    table: string,
  ): Promise<number | null> {
    const sql = `SELECT reltuples AS estimate FROM pg_class WHERE oid = '${database}.${table}'::regclass;`;
    return (await this.singleExecute<{ estimate: number }>(sql)).rows[0]
      .estimate;
  }

  attachHeaders(
    statements: SqlStatementResult[],
    schema: DatabaseSchemas | undefined,
  ): SqlStatementResult<QueryTypedResult>[] {
    if (!schema) return statements.map(this.attachType);

    const result = statements.map((statement) => {
      const headers = statement.result.headers.map((header) => {
        const column = schema.getColumnById(header.tableId, header.columnId);

        const type = mapDataType(schema.getTypeById(header.dataType));
        if (!column) return { ...header, type };

        return {
          ...header,
          schema: {
            database: column.schemaName,
            column: column.name,
            table: column.tableName,
          },
          type,
          columnDefinition: schema.getColumnById(
            header.tableId,
            header.columnId,
          ),
        };
      });
      return this.attachType({
        ...statement,
        result: { ...statement.result, headers },
      });
    });

    return result;
  }

  protected getTypeClass(
    header: QueryResultHeader,
  ): (value: unknown) => BaseType {
    if (header.type.type === 'number')
      return (value: unknown) => new NumberType(value as string);

    if (header.type.type === 'decimal')
      return (value: unknown) => new DecimalType(value as string);

    if (header.type.type === 'json')
      return (value) => new JsonType(value as object);

    if (header.type.type === 'point')
      return (value) => {
        const typedValue = value as { x: string; y: string } | undefined | null;
        if (!typedValue) return new PointType(typedValue);
        return new PointType({
          x: Number(typedValue.x),
          y: Number(typedValue.y),
        });
      };

    return (value: unknown) => new StringType(value as string);
  }

  createTypeValue(header: QueryResultHeader, value: unknown): BaseType {
    return this.getTypeClass(header)(value);
  }

  attachType(statements: SqlStatementResult) {
    const headers = statements.result.headers;
    const rows = statements.result.rows;

    for (const header of headers) {
      const createType = this.getTypeClass(header);
      for (const row of rows) {
        row[header.name] = createType(row[header.name]);
      }
    }

    return statements as unknown as SqlStatementResult<QueryTypedResult>;
  }
}
