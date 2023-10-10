import {
  ConnectionStoreConfig,
  ConnectionStoreItem,
} from 'drivers/base/SQLLikeConnection';
import { QueryDialetType } from 'libs/QueryBuilder';
import RemoteAPI from 'renderer/utils/RemoteAPI';

export default class ConnectionListRemoteStorage {
  protected connections: ConnectionStoreItem[] = [];
  protected dict: Record<string, ConnectionStoreItem> = {};
  protected masterPassword: string;
  protected salt: string;
  protected api: RemoteAPI;

  constructor(api: RemoteAPI, masterPassword: string, salt: string) {
    this.api = api;
    this.masterPassword = masterPassword;
    this.salt = salt;
  }

  async loadAll() {
    const conns = await this.api.getAll();
    this.connections = [];

    for (const conn of conns.nodes) {
      try {
        const config: ConnectionStoreConfig = JSON.parse(
          await window.electron.decrypt(
            conn.content,
            this.masterPassword,
            this.salt,
          ),
        );

        if (config) {
          this.connections.push({
            config,
            id: conn.id,
            createdAt: conn.created_at,
            lastUsedAt: conn.last_used_at,
            name: conn.name,
            type: conn.connection_type as QueryDialetType,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    this.dict = this.connections.reduce(
      (acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      },
      {} as Record<string, ConnectionStoreItem>,
    );
  }

  get(id: string): ConnectionStoreItem | undefined {
    return this.dict[id];
  }

  getAll(): ConnectionStoreItem[] {
    return [...this.connections];
  }

  async save(
    data: Omit<ConnectionStoreItem, 'id'> & { id?: string },
  ): Promise<ConnectionStoreItem> {
    const r = await this.api.saveConnection(data.id, {
      connection_type: data.type,
      content: await window.electron.encrypt(
        JSON.stringify(data.config),
        this.masterPassword,
        this.salt,
      ),
      name: data.name,
    });

    const newData = { ...data, id: r.id };
    this.dict[newData.id] = newData;

    const found = this.connections.findIndex((conn) => conn.id === newData.id);
    if (found >= 0) {
      this.connections[found] = newData;
    } else {
      this.connections.push(newData);
    }

    return newData;
  }

  async remove(id: string) {
    delete this.dict[id];
    this.connections = this.connections.filter((conn) => conn.id !== id);
    this.api.removeConnection(id);
  }

  async updateLastUsed(id: string) {
    if (this.dict[id]) {
      this.dict[id].lastUsedAt = Math.ceil(Date.now() / 1000);
      this.api.updateConnectionLastUsed(id);
    }
  }
}
