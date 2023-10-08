import BaseType from 'renderer/datatype/BaseType';
import { TableColumnSchema } from './SqlSchema';

export interface QueryResultHeaderType {
  type:
    | 'string'
    | 'date'
    | 'string_date'
    | 'string_time'
    | 'string_datetime'
    | 'number'
    | 'json'
    | 'decimal'
    | 'other'
    | 'enum'
    | 'point';
  enumValues?: string[];
}

export interface QueryResultHeader {
  name: string;
  type: QueryResultHeaderType;
  dataType: number;
  tableId?: number; // This is for PostgreSQL
  columnId?: number; // This is for PostgreSQL
  columnDefinition?: TableColumnSchema;
  schema?: {
    database?: string;
    table?: string;
    column?: string;
    primaryKey?: boolean;
  };
}

export interface QueryResultWithIndex<T = unknown> {
  data: Record<string, T>;
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

export interface QueryTypedResult extends QueryResultCommon {
  rows: Record<string, BaseType>[];
}
