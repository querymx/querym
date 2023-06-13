interface TableColumnSchema {
  name: string;
}

export type TableType = 'VIEW' | 'TABLE';

export type TableConstraintTypeSchema = 'PRIMARY KEY' | 'UNIQUE';

interface TableConstraintSchema {
  name: string;
  columns: string[];
  type: TableConstraintTypeSchema;
}

interface TableSchema {
  name: string;
  type: TableType;
  columns: Record<string, TableColumnSchema>;
  constraints: TableConstraintSchema[];
  primaryKey: string[];
}

export interface DatabaseSchema {
  name: string;
  tables: Record<string, TableSchema>;
}

export type DatabaseSchemas = Record<string, DatabaseSchema>;
