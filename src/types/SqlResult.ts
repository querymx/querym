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
  resultHeader?: {
    affectedRows: number;
    changedRows: number;
  };
  keys: QueryResultPrimary;
  headers: QueryResultHeader[];
  rows: unknown[][];
}
