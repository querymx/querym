import {
  QueryResultHeader,
  QueryResultHeaderType,
  QueryResult,
} from 'types/SqlResult';
import SQLLikeConnection, {
  DatabaseConnectionConfig,
} from './SQLLikeConnection';
import { createPool, Pool } from 'mysql2/promise';

interface ColumnDefinition {
  _buf: Buffer;
  _orgTableLength: number;
  _orgTableStart: number;
  _orgNameLength: number;
  _orgNameStart: number;
  type: number;
  name: string;
  flags: number;
}

interface MySQLError {
  sqlMessage?: string;
}

function mapHeaderType(column: ColumnDefinition): QueryResultHeader {
  // Document about MySQL header
  // https://dev.mysql.com/doc/dev/mysql-server/latest/page_protocol_com_query_response_text_resultset_column_definition.html
  const tableName = column._orgTableLength
    ? column._buf
        .subarray(
          column._orgTableStart,
          column._orgTableStart + column._orgTableLength
        )
        .toString()
    : undefined;

  let type: QueryResultHeaderType = { type: 'string' };

  // List of all column type
  // https://dev.mysql.com/doc/dev/mysql-server/latest/field__types_8h_source.html
  if (column.type === 245) {
    type = { type: 'json' };
  } else if ([0, 1, 2, 3, 4, 5, 8, 9, 16].includes(column.type)) {
    type = { type: 'number' };
  } else if ([0, 246].includes(column.type)) {
    type = { type: 'decimal' };
  }

  const databaseNameLength = column._buf[13];
  const databaseName =
    databaseNameLength > 0
      ? column._buf.subarray(14, 14 + databaseNameLength).toString()
      : undefined;

  return {
    name: column.name,
    type,
    schema: {
      database: databaseName,
      table: tableName,
      column: column.name,
      primaryKey: !!(column.flags & 0x2),
    },
  };
}

export default class MySQLConnection extends SQLLikeConnection {
  protected connectionConfig: DatabaseConnectionConfig;
  protected connection: Pool | undefined;
  protected onStateChangedCallback: (state: string) => void;

  constructor(
    connectionConfig: DatabaseConnectionConfig,
    statusChanged: (state: string) => void
  ) {
    super();
    this.connectionConfig = connectionConfig;
    this.onStateChangedCallback = statusChanged;
  }

  protected async getConnection() {
    if (!this.connection) {
      this.connection = createPool({
        ...this.connectionConfig,
        dateStrings: true,
        namedPlaceholders: true,
        connectionLimit: 1,
      });

      this.onStateChangedCallback('Connected');
    }

    return this.connection;
  }

  async query(
    sql: string,
    params?: Record<string, unknown>
  ): Promise<QueryResult> {
    try {
      const conn = await this.getConnection();
      const result = await conn.query(sql, params);

      // If it is not array, it means
      // it is not SELECT
      if (!Array.isArray(result[0])) {
        return {
          resultHeader: {
            affectedRows: result[0].affectedRows,
            changedRows: result[0].changedRows || 0,
          },
          headers: [],
          rows: [],
          keys: {},
          error: null,
        };
      }

      const headers = (result[1] as unknown as ColumnDefinition[]).map(
        mapHeaderType
      );

      return {
        headers,
        rows: result[0] as Record<string, unknown>[],
        keys: {},
        error: null,
      };
    } catch (e: unknown) {
      return {
        headers: [],
        rows: [],
        keys: {},
        error: {
          message: (e as MySQLError).sqlMessage || (e as MySQLError).toString(),
        },
      };
    }
  }

  async close() {
    if (this.connection) {
      const conn = await this.getConnection();
      conn.end();
      conn.destroy();
    }
  }
}
