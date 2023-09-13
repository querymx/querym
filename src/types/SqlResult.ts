import { TableColumnSchema } from './SqlSchema';

export interface QueryResultHeaderType {
  type: 'string' | 'number' | 'json' | 'decimal' | 'other';
}

export interface QueryResultHeader {
  name: string;
  type: QueryResultHeaderType;
  columnDefinition?: TableColumnSchema;
  schema?: {
    database?: string;
    table?: string;
    column?: string;
    primaryKey?: boolean;
  };
}

export interface QueryResultWithIndex {
  data: Record<string, unknown>;
  rowIndex: number;
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
