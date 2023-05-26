import {
  QueryResultHeader,
  QueryResultHeaderType,
  QueryResult,
} from 'types/SqlResult';
import SQLLikeConnection, {
  DatabaseConnectionConfig,
} from './SQLLikeConnection';
import { Connection, createConnection, RowDataPacket } from 'mysql2/promise';

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

  return {
    name: column.name,
    type,
    schema: {
      table: tableName,
      column: column.name,
      primaryKey: !!(column.flags & 0x2),
    },
  };
}

export default class MySQLConnection extends SQLLikeConnection {
  protected connectionConfig: DatabaseConnectionConfig;
  protected connection: Connection | undefined;

  constructor(connectionConfig: DatabaseConnectionConfig) {
    super();
    this.connectionConfig = connectionConfig;
  }

  protected async getConnection() {
    if (!this.connection) {
      this.connection = await createConnection({
        ...this.connectionConfig,
        dateStrings: true,
        namedPlaceholders: true,
      });
    }
    return this.connection;
  }

  async query(
    sql: string,
    params?: Record<string, unknown>
  ): Promise<QueryResult> {
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
      };
    }

    const headers = (result[1] as unknown as ColumnDefinition[]).map(
      mapHeaderType
    );

    const rows = (result[0] as RowDataPacket[]).map((row) =>
      headers.map((header) => row[header.name])
    );

    return {
      headers,
      rows,
      keys: {},
    };
  }

  async close() {
    const conn = await this.getConnection();
    conn.destroy();
  }
}
