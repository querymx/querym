import CommunicateHandler from './../CommunicateHandler';
import MySQLConnection from '../../drivers/MySQLConnection';
import SQLLikeConnection, {
  ConnectionStoreItem,
  DatabaseConnectionConfig,
} from '../../drivers/SQLLikeConnection';

let connection: SQLLikeConnection | undefined;

CommunicateHandler.handle(
  'connect',
  async ([store]: [ConnectionStoreItem], { window }) => {
    if (store.type === 'mysql') {
      connection = new MySQLConnection(
        store.config as unknown as DatabaseConnectionConfig,
        (status) => {
          if (window) {
            window.webContents.send('connection-status-change', status);
          }
        }
      );
      console.log(connection);
    }
    return true;
  }
)
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
