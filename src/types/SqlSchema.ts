export interface TableColumnSchema {
  id?: number;
  name: string;
  tableName: string;
  schemaName: string;
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
  id?: number;
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

export type DatabaseSchemaList = Record<string, DatabaseSchema>;

export interface DatabaseDataType {
  id: number;
  name: string;
  category: string;
}

export class DatabaseSchemas {
  protected schema: DatabaseSchemaList = {};
  protected tableIds: Record<string, TableSchema> = {};
  protected types: Record<string, DatabaseDataType> = {};
  protected typesIds: Record<string, DatabaseDataType> = {};

  addType(type: DatabaseDataType) {
    this.types[type.name] = type;
    this.typesIds[type.id.toString()] = type;
  }

  getTypeById(id: number): DatabaseDataType | undefined {
    return this.typesIds[id.toString()];
  }

  getTypeByName(name: string): DatabaseDataType | undefined {
    return this.types[name];
  }

  addDatabase(database: string) {
    if (this.schema[database]) return;
    this.schema[database] = {
      tables: {},
      triggers: [],
      events: [],
      name: database,
    };
  }

  getTableList(database: string) {
    if (this.schema[database]) return this.schema[database].tables;
    return {};
  }

  getDatabase(database: string): DatabaseSchema {
    return this.schema[database];
  }

  addEvent(database: string, event: string) {
    if (this.schema[database]) {
      this.schema[database].events.push(event);
    }
  }

  addTrigger(database: string, trigger: string) {
    if (this.schema[database]) {
      this.schema[database].triggers.push(trigger);
    }
  }

  addTable(database: string, table: Partial<TableSchema>) {
    if (this.schema[database]) {
      const tmp: TableSchema = {
        columns: {},
        constraints: [],
        primaryKey: [],
        type: 'TABLE',
        name: '',
        ...table,
      };

      this.schema[database].tables[tmp.name] = tmp;
      if (tmp.id) {
        this.tableIds[tmp.id] = tmp;
      }
    }
  }

  getTable(databaseName: string, tableName: string) {
    const db = this.schema[databaseName];
    if (!db) return;
    return db.tables[tableName];
  }

  addColumn(
    databaseName: string,
    tableName: string,
    column: TableColumnSchema,
  ) {
    const table = this.getTable(databaseName, tableName);
    if (!table) return;
    table.columns[column.name] = column;
  }

  getColumnById(tableId: number | undefined, columnId: number | undefined) {
    if (tableId === undefined) return;
    if (columnId === undefined) return;

    const table = this.getTableById(tableId);
    if (!table) return;

    return Object.values(table.columns).find((col) => col.id === columnId);
  }

  addPrimaryKey(databaseName: string, tableName: string, column: string) {
    const table = this.getTable(databaseName, tableName);
    if (!table) return;
    table.primaryKey.push(column);
  }

  addConstraint(
    databaseName: string,
    tableName: string,
    constraintName: string,
    type: TableConstraintTypeSchema,
    column: string,
  ) {
    const table = this.getTable(databaseName, tableName);
    if (!table) return;

    const constraint = table.constraints.find(
      (constraint) => constraint.name === constraintName,
    );

    if (constraint) {
      constraint.columns.push(column);
      table.constraints.push({
        name: constraintName,
        columns: [column],
        type,
      });
    }
  }

  getTableById(id: number): TableSchema | undefined {
    return this.tableIds[id];
  }

  getSchema() {
    return this.schema;
  }
}
