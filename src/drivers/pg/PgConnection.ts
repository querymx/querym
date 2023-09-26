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
    // do nothing
  }

  async killCurrentQuery() {
    // do nothing
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
            dataType: field.dataTypeID,
            columnId: field.columnID,
            tableId: field.tableID,
            type: {
              type: 'string',
            },
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
