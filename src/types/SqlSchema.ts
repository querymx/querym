export interface TableColumnSchema {
  name: string;
  dataType: string;
  charLength: number | null;
  enumValues?: string[];
  numericScale?: number | null;
  nuermicPrecision?: number | null;
  nullable: boolean;
  default?: string | null;
  comment: string;
}

export type TableType = 'VIEW' | 'TABLE';

export type TableConstraintTypeSchema = 'PRIMARY KEY' | 'UNIQUE';

interface TableConstraintSchema {
  name: string;
  columns: string[];
  type: TableConstraintTypeSchema;
}

export interface TableSchema {
  name: string;
  type: TableType;
  columns: Record<string, TableColumnSchema>;
  constraints: TableConstraintSchema[];
  primaryKey: string[];
}

export interface TableDefinitionSchema {
  name: string;
  createSql: string;
  columns: TableColumnSchema[];
}

export interface DatabaseSchema {
  name: string;
  tables: Record<string, TableSchema>;
  events: string[];
  triggers: string[];
}

export type DatabaseSchemas = Record<string, DatabaseSchema>;
