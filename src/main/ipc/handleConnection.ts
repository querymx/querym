import MySQLConnection from './../../drivers/MySQLConnection';
import SQLLikeConnection, {
  ConnectionStoreItem,
  DatabaseConnectionConfig,
} from './../../drivers/SQLLikeConnection';
import fs from 'fs';
import { ipcMain, safeStorage } from 'electron';
import { ConfigurationFileFormat } from 'types/FileFormatType';

export default class ConnectionIpcHandler {
  protected connection: SQLLikeConnection | undefined;

  register() {
    ipcMain.handle(
      'load-connection-config',
      async (): Promise<ConfigurationFileFormat> => {
        try {
          const json: ConfigurationFileFormat = JSON.parse(
            fs.readFileSync('./connections.json', 'utf8')
          );

          if (json.encrypted) {
            return {
              ...json,
              config: safeStorage.decryptString(
                Buffer.from(json.config, 'base64')
              ),
            };
          }
        } catch (ee) {
          return {
            version: 1,
            encrypted: safeStorage.isEncryptionAvailable(),
            config: '[]',
          };
        }

        return {
          version: 1,
          encrypted: safeStorage.isEncryptionAvailable(),
          config: '[]',
        };
      }
    );

    ipcMain.handle(
      'save-connection-config',
      async (_, [configs]: [ConfigurationFileFormat]): Promise<void> => {
        fs.writeFileSync(
          './connections.json',
          JSON.stringify(
            {
              ...configs,
              version: 1,
              encrypted: safeStorage.isEncryptionAvailable(),
              config: safeStorage.isEncryptionAvailable()
                ? safeStorage.encryptString(configs.config).toString('base64')
                : configs.config,
            },
            undefined,
            2
          )
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
