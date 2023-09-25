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

interface DatabaseDataType {
  id: number;
  name: string;
  category: string;
}

export class DatabaseDataTypes {
  protected types: Record<string, DatabaseDataType> = {};
  protected typesIds: Record<string, DatabaseDataType> = {};

  addType(option: DatabaseDataType) {
    this.types[option.name] = option;
    this.typesIds[option.id.toString()] = option;
  }

  getTypeById(id: number): DatabaseDataType | undefined {
    return this.typesIds[id.toString()];
  }

  getTypeByName(name: string): DatabaseDataType | undefined {
    return this.types[name];
  }
}
