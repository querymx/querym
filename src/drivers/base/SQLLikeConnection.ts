import { QueryDialetType } from 'libs/QueryBuilder';
import { QueryResult } from 'types/SqlResult';

export type ConnectionStoreConfig = Partial<
  MySqlConnectionConfig & SqliteConnectionConfig & PgConnectionConfig
>;

export interface MySqlConnectionConfig {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
}

export type ConnectionSslOption =
  | boolean
  | {
      ca?: string;
      cert?: string;
      key?: string;
    };

export interface PgConnectionConfig {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
  ssl?: ConnectionSslOption;
}

export interface SqliteConnectionConfig {
  path: string;
}

export interface ConnectionStoreItemWithoutId {
  id?: string;
  name: string;
  type: QueryDialetType;
  protectionLevel?: number;
  tag?: string;
  color?: string;
  createdAt: number;
  lastUsedAt: number;
  config: ConnectionStoreConfig;
}

export interface ConnectionStoreItem extends ConnectionStoreItemWithoutId {
  id: string;
}

export type SqlQueryCallback = (
  sql: string,
  params?: Record<string, unknown>,
  safetyLevel?: number,
) => Promise<QueryResult>;

export default abstract class SQLLikeConnection {
  abstract query(
    sql: string,
    params?: Record<string, unknown>,
  ): Promise<QueryResult>;

  abstract killCurrentQuery(): Promise<void>;
  abstract close(): void;
}
