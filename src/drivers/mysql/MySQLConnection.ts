import {
  QueryResultHeader,
  QueryResultHeaderType,
  QueryResult,
} from 'types/SqlResult';
import SQLLikeConnection, {
  MySqlConnectionConfig,
} from '../base/SQLLikeConnection';
import {
  PoolConnection,
  createPool,
  Pool,
  createConnection,
} from 'mysql2/promise';

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
          column._orgTableStart + column._orgTableLength,
        )
        .toString()
    : undefined;

  const type: QueryResultHeaderType = { type: 'string' };
  const databaseNameLength = column._buf[13];
  const databaseName =
    databaseNameLength > 0
      ? column._buf.subarray(14, 14 + databaseNameLength).toString()
      : undefined;

  return {
    name: column.name,
    dataType: column.type,
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
  protected connectionConfig: MySqlConnectionConfig;
  protected pool: Pool | undefined;
  protected currentConnection: PoolConnection | undefined;
  protected lastActivity = 0;
  protected isRunning = false;
  protected keepAliveTimerId?: NodeJS.Timer;

  constructor(connectionConfig: MySqlConnectionConfig) {
    super();
    this.connectionConfig = connectionConfig;
  }

  protected async getConnection() {
    if (!this.pool) {
      this.pool = createPool({
        ...this.connectionConfig,
        dateStrings: true,
        namedPlaceholders: true,
        connectionLimit: 1,
      });

      this.lastActivity = Date.now();

      this.keepAliveTimerId = setInterval(() => {
        if (Date.now() - this.lastActivity > 6000 && !this.isRunning) {
          this.lastActivity = Date.now();
          this.ping();
        }
      }, 5000);

      this.pool.on('connection', (connection) => {
        this.currentConnection = connection;
      });
    }

    return this.pool;
  }

  protected async ping() {
    this.currentConnection?.ping();
  }

  async killCurrentQuery() {
    if (this.currentConnection) {
      // Make another connection quickly to cancel the query
      const tmpConnection = await createConnection(this.connectionConfig);
      tmpConnection
        .query('KILL QUERY ?;', [this.currentConnection.threadId])
        .then()
        .catch();
      tmpConnection.end();
      tmpConnection.destroy();
    }
  }

  async query(
    sql: string,
    params?: Record<string, unknown>,
  ): Promise<QueryResult> {
    this.lastActivity = Date.now();
    this.isRunning = true;

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
        mapHeaderType,
      );

      this.isRunning = false;
      return {
        headers,
        rows: result[0] as Record<string, unknown>[],
        keys: {},
        error: null,
      };
    } catch (e: unknown) {
      this.isRunning = false;

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
    if (this.pool) {
      this.pool.end().catch(console.error);
    }

    if (this.keepAliveTimerId) {
      clearTimeout(this.keepAliveTimerId);
    }
  }
}
