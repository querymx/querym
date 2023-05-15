export interface QueryResultHeaderType {
  type: 'string' | 'number' | 'json';
}

export interface QueryResultHeader {
  name: string;
  type: QueryResultHeaderType;
  schema?: {
    database?: string;
    table?: string;
    column?: string;
    primaryKey?: boolean;
  };
}

export type QueryResultPrimary = Record<string, Record<string, unknown>>;

export interface QueryResult {
  keys: QueryResultPrimary;
  headers: QueryResultHeader[];
  rows: unknown[][];
}

export interface DatabaseConnectionConfig {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
}

interface TableColumnSchema {
  name: string;
}

interface TableSchema {
  name: string;
  columns: Record<string, TableColumnSchema>;
}

interface DatabaseSchema {
  name: string;
  tables: Record<string, TableSchema>;
}

export type DatabaseSchemas = Record<string, DatabaseSchema>;

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
