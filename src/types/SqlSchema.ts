interface TableColumnSchema {
  name: string;
}

interface TableConstraintSchema {
  name: string;
  columns: string[];
  type: 'PRIMARY KEY' | 'UNIQUE';
}

interface TableSchema {
  name: string;
  columns: Record<string, TableColumnSchema>;
  constraints: TableConstraintSchema[];
  primaryKey: string[];
}

export interface DatabaseSchema {
  name: string;
  tables: Record<string, TableSchema>;
}

export type DatabaseSchemas = Record<string, DatabaseSchema>;
