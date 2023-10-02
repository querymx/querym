import { ConnectionStoreItem } from 'drivers/base/SQLLikeConnection';

export default abstract class IConnectionListStorage {
  abstract loadAll(): Promise<void>;
  abstract get(id: string): ConnectionStoreItem | undefined;
  abstract getAll(): ConnectionStoreItem[];
  abstract save(
    data: Omit<ConnectionStoreItem, 'id'> & { id?: string },
  ): Promise<ConnectionStoreItem>;
  abstract remove(id: string): Promise<void>;
  abstract updateLastUsed(id: string): Promise<void>;
}
