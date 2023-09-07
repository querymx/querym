import MySQLConnection from './../../drivers/MySQLConnection';
import SQLLikeConnection, {
  ConnectionStoreItem,
  DatabaseConnectionConfig,
} from './../../drivers/SQLLikeConnection';
import { ipcMain } from 'electron';
import BaseIpcHandler from './base';

export default class ConnectionIpcHandler extends BaseIpcHandler {
  protected connection: SQLLikeConnection | undefined;

  register() {
    ipcMain.handle('connect', async (_, [store]: [ConnectionStoreItem]) => {
      if (store.type === 'mysql') {
        this.connection = new MySQLConnection(
          store.config as unknown as DatabaseConnectionConfig,
          (status) => {
            if (this.window) {
              this.window.webContents.send('connection-status-change', status);
            }
          }
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

    ipcMain.handle('kill-current-query', async () => {
      return await this.connection?.killCurrentQuery();
    });
  }

  cleanup() {
    if (this.connection) {
      this.connection.close();
    }
  }
}
