import CommunicateHandler from './../CommunicateHandler';
import MySQLConnection from '../../drivers/mysql/MySQLConnection';
import SQLLikeConnection, {
  ConnectionStoreItem,
  DatabaseConnectionConfig,
} from '../../drivers/base/SQLLikeConnection';
import PgConnection from '../../drivers/pg/PgConnection';

let connection: SQLLikeConnection | undefined;

CommunicateHandler.handle('connect', async ([store]: [ConnectionStoreItem]) => {
  if (connection) {
    connection.close();
  }

  const config = store.config as unknown as DatabaseConnectionConfig;

  if (store.type === 'mysql') {
    connection = new MySQLConnection(config);
  } else if (store.type === 'postgre') {
    connection = new PgConnection(config);
  }
  return true;
})
  .handle(
    'query',
    async ([sql, params]: [string, Record<string, unknown> | undefined]) => {
      return await connection?.query(sql, params);
    }
  )
  .handle('close', () => {
    if (connection) {
      connection.close();
    }
  })
  .handle('kill-current-query', async () => {
    return await connection?.killCurrentQuery();
  })
  .cleanup(() => {
    if (connection) {
      connection.close();
    }
  });
