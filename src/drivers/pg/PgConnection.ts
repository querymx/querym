import { QueryResult, QueryResultHeader } from 'types/SqlResult';
import SQLLikeConnection, {
  PgConnectionConfig,
} from '../base/SQLLikeConnection';

import { Client, types } from 'pg';

types.setTypeParser(1114, function (stringValue) {
  return stringValue;
});

types.setTypeParser(1082, function (stringValue) {
  return stringValue;
});

export default class PgConnection extends SQLLikeConnection {
  protected client: Client | undefined;
  protected connectionConfig: PgConnectionConfig;

  constructor(connectionConfig: PgConnectionConfig) {
    super();
    this.connectionConfig = connectionConfig;
  }

  protected async getConnection(): Promise<Client> {
    if (!this.client) {
      const client = new Client(this.connectionConfig);
      this.client = client;
      await client.connect();
      return this.client;
    }

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
          }) as QueryResultHeader,
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
