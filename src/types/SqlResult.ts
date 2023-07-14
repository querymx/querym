export interface QueryResultHeaderType {
  type: 'string' | 'number' | 'json' | 'decimal';
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

interface QueryResultCommon {
  resultHeader?: {
    affectedRows: number;
    changedRows: number;
  };
  error: {
    message: string;
  } | null;
  keys: QueryResultPrimary;
  headers: QueryResultHeader[];
}

export interface QueryResult<T = Record<string, unknown>>
  extends QueryResultCommon {
  rows: T[];
}

export interface QueryRowBasedResult extends QueryResultCommon {
  rows: unknown[][];
}
