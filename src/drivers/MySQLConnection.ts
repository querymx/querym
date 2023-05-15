import SQLLikeConnection, {
  DatabaseConnectionConfig,
  QueryResult,
  QueryResultHeaderType,
} from './SQLLikeConnection';
import { Connection, createConnection, RowDataPacket } from 'mysql2/promise';

interface ColumnDefinition {
  _buf: Buffer;
  type: number;
  name: string;
}

function mapHeaderType(column: ColumnDefinition): QueryResultHeaderType {
  // Document about MySQL header
  // https://dev.mysql.com/doc/dev/mysql-server/latest/page_protocol_com_query_response_text_resultset_column_definition.html

  // List of all column type
  // https://dev.mysql.com/doc/dev/mysql-server/latest/field__types_8h_source.html
  if (column.type === 245) {
    return { type: 'json' };
  } else if ([0, 1, 2, 3, 4, 5, 8, 9, 16, 246].includes(column.type)) {
    return { type: 'number' };
  }

  return { type: 'string' };
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

    const headers = (result[1] as unknown as ColumnDefinition[]).map(
      (column: ColumnDefinition) => ({
        name: column.name,
        type: mapHeaderType(column),
      })
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
