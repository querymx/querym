import MySQLConnection from './../../drivers/MySQLConnection';
import SQLLikeConnection, {
  ConnectionStoreItem,
  DatabaseConnectionConfig,
} from './../../drivers/SQLLikeConnection';
import { BrowserWindow, ipcMain } from 'electron';

export default class ConnectionIpcHandler {
  protected connection: SQLLikeConnection | undefined;
  protected window?: BrowserWindow;

  attachWindow(window: BrowserWindow) {
    this.window = window;
  }

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
  }

  cleanup() {
    if (this.connection) {
      this.connection.close();
    }
  }
}
