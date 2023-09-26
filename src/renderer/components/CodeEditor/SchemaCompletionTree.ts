import { Completion } from '@codemirror/autocomplete';
import {
  DatabaseSchema,
  DatabaseSchemaList,
  TableSchema,
} from 'types/SqlSchema';

function buildTableCompletionTree(table: TableSchema): SchemaCompletionTree {
  const root = new SchemaCompletionTree();

  for (const col of Object.values(table.columns)) {
    root.addOption(col.name, {
      label: col.name,
      type: 'property',
      detail: col.dataType,
      boost: 3,
    });
  }

  return root;
}

function buildDatabaseCompletionTree(
  database: DatabaseSchema
): SchemaCompletionTree {
  const root = new SchemaCompletionTree();

  for (const table of Object.values(database.tables)) {
    root.addOption(table.name, {
      label: table.name,
      type: 'table',
      detail: 'table',
      boost: 1,
    });

    root.addChild(table.name, buildTableCompletionTree(table));
  }

  return root;
}

function buildCompletionTree(
  schema: DatabaseSchemaList | undefined,
  currentDatabase: string | undefined
): SchemaCompletionTree {
  const root: SchemaCompletionTree = new SchemaCompletionTree();
  if (!schema) return root;

  // Build current database table list
  if (currentDatabase && schema[currentDatabase]) {
    for (const table of Object.values(schema[currentDatabase].tables)) {
      root.addOption(table.name, {
        label: table.name,
        type: 'table',
        detail: 'table',
        boost: 1,
      });

      root.addChild(table.name, buildTableCompletionTree(table));
    }
  }

  for (const database of Object.values(schema)) {
    root.addOption(database.name, {
      label: database.name,
      type: 'property',
      detail: 'database',
    });

    root.addChild(database.name, buildDatabaseCompletionTree(database));
  }

  return root;
}
export default class SchemaCompletionTree {
  protected options: Record<string, Completion> = {};
  protected child: Record<string, SchemaCompletionTree> = {};

  static build(
    schema: DatabaseSchemaList | undefined,
    currentDatabase: string | undefined
  ) {
    return buildCompletionTree(schema, currentDatabase);
  }

  addOption(name: string, complete: Completion) {
    if (!this.options[name]) {
      this.options[name] = complete;
    }
  }

  getOptions(): Completion[] {
    return Object.values(this.options);
  }

  getChild(name: string): SchemaCompletionTree | undefined {
    return this.child[name];
  }

  addChild(name: string, tree: SchemaCompletionTree) {
    if (!this.child[name]) {
      this.child[name] = tree;
    }
  }
}
