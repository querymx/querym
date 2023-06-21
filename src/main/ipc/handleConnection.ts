import MySQLConnection from './../../drivers/MySQLConnection';
import SQLLikeConnection, {
  ConnectionStoreItem,
  DatabaseConnectionConfig,
} from './../../drivers/SQLLikeConnection';
import { ipcMain } from 'electron';

export default class ConnectionIpcHandler {
  protected connection: SQLLikeConnection | undefined;

  register() {
    ipcMain.handle('connect', async (_, [store]: [ConnectionStoreItem]) => {
      if (store.type === 'mysql') {
        console.log('create mysql connection');
        this.connection = new MySQLConnection(
          store.config as unknown as DatabaseConnectionConfig
        );
      }
      return true;
    });

    ipcMain.handle(
      'query',
      async (
        _,
        [sql, params]: [string, Record<string, unknown> | undefined]
      ) => {
        return await this.connection?.query(sql, params);
      }
    );

    ipcMain.handle('close', () => {
      this.cleanup();
    });
  }

  cleanup() {
    if (this.connection) {
      this.connection.close();
    }
  }
}
