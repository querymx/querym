import MySQLConnection from './../../drivers/MySQLConnection';
import SQLLikeConnection, {
  ConnectionStoreItem,
  DatabaseConnectionConfig,
} from './../../drivers/SQLLikeConnection';
import fs from 'fs';
import { ipcMain } from 'electron';

export default class ConnectionIpcHandler {
  protected connection: SQLLikeConnection | undefined;

  register() {
    ipcMain.handle(
      'load-connection-config',
      async (): Promise<ConnectionStoreItem[]> => {
        try {
          return JSON.parse(fs.readFileSync('./connections.json', 'utf8'));
        } catch {
          return [];
        }
      }
    );

    ipcMain.handle(
      'save-connection-config',
      async (_, [configs]: [ConnectionStoreItem[]]): Promise<void> => {
        fs.writeFileSync(
          './connections.json',
          JSON.stringify(configs, undefined, 2)
        );
      }
    );

    ipcMain.handle('connect', async (_, [store]: [ConnectionStoreItem]) => {
      if (store.type === 'mysql') {
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
