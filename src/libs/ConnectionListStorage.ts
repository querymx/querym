import { ConnectionStoreItem } from 'drivers/base/SQLLikeConnection';
import { v1 as uuidv1 } from 'uuid';
import { db } from 'renderer/db';

export default class ConnectionListStorage {
  protected connections: ConnectionStoreItem[] = [];
  protected dict: Record<string, ConnectionStoreItem> = {};

  async loadAll() {
    this.connections = await db
      .table<ConnectionStoreItem>('connections')
      .toArray();

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
    return this.connections;
  }

  async save(
    data: Omit<ConnectionStoreItem, 'id'> & { id?: string },
  ): Promise<ConnectionStoreItem> {
    const id = data.id ? data.id : uuidv1();
    const newData: ConnectionStoreItem = {
      ...data,
      id,
      createdAt: data.createdAt ? data.createdAt : Math.ceil(Date.now() / 1000),
    };

    this.dict[newData.id] = newData;
    db.table('connections').put(newData);

    return newData;
  }

  async remove(id: string) {
    delete this.dict[id];
    db.table('connections').delete(id);
  }

  async updateLastUsed(id: string) {
    if (this.dict[id]) {
      this.dict[id].lastUsedAt = Math.ceil(Date.now() / 1000);
      db.table('connections').put(this.dict[id]);
    }
  }
}
