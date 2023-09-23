import { QueryResult, QueryResultHeader } from 'types/SqlResult';
import SQLLikeConnection, {
  DatabaseConnectionConfig,
} from '../base/SQLLikeConnection';

import { Client } from 'pg';

export default class PgConnection extends SQLLikeConnection {
  protected client: Client | undefined;
  protected connectionConfig: DatabaseConnectionConfig;

  constructor(connectionConfig: DatabaseConnectionConfig) {
    super();
    this.connectionConfig = connectionConfig;
  }

  protected async getConnection(): Promise<Client> {
    const client = new Client(this.connectionConfig);
    this.client = client;

    await client.connect();
    return this.client;
  }

  protected async ping() {
    // throw 'not implemented';
  }

  async killCurrentQuery() {
    throw 'not implemented';
  }

  async query(sql: string): Promise<QueryResult> {
    const client = await this.getConnection();
    const result = await client.query(sql);

    return {
      keys: {},
      error: null,
      headers: result.fields.map(
        (field) =>
          ({
            name: field.name,
            type: {
              type: 'string',
            },
            schema: '',
          } as QueryResultHeader)
      ),
      rows: result.rows,
      resultHeader: {
        affectedRows: result.rowCount,
        changedRows: result.rowCount,
      },
    };
  }

  async close() {
    if (this.client) {
      this.client.end();
    }
  }
}
