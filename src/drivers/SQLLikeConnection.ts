import { QueryResult } from 'types/SqlResult';

export interface DatabaseConnectionConfig {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
}

export type ConnectionStoreConfig = Partial<
  MySqlConnectionConfig & SqliteConnectionConfig
>;

export interface MySqlConnectionConfig {
  database: string;
  user: string;
  password: string;
  host: string;
  port: string;
}

export interface SqliteConnectionConfig {
  path: string;
}

export interface ConnectionStoreItem {
  id: string;
  name: string;
  type?: string;
  config: ConnectionStoreConfig;
}

export type SqlQueryCallback = (
  sql: string,
  params?: Record<string, unknown>,
  safetyLevel?: number
) => Promise<QueryResult>;

export default abstract class SQLLikeConnection {
  abstract query(
    sql: string,
    params?: Record<string, unknown>
  ): Promise<QueryResult>;

  abstract close(): void;
}
