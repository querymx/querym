import { Completion } from '@codemirror/autocomplete';
import { SQLDialectSpec } from 'language/dist';
import {
  DatabaseSchema,
  DatabaseSchemaList,
  TableSchema,
} from 'types/SqlSchema';

function buildTableCompletionTree(
  table: TableSchema,
  dialect: SQLDialectSpec,
  keywords: Record<string, boolean>,
): SchemaCompletionTree {
  const root = new SchemaCompletionTree();

  for (const col of Object.values(table.columns)) {
    root.addOption(col.name, {
      label: col.name,
      apply: escapeConflictedId(dialect, col.name, keywords),
      type: 'property',
      detail: col.dataType,
      boost: 3,
    });
  }

  return root;
}

function buildDatabaseCompletionTree(
  database: DatabaseSchema,
  dialect: SQLDialectSpec,
  keywords: Record<string, boolean>,
): SchemaCompletionTree {
  const root = new SchemaCompletionTree();

  for (const table of Object.values(database.tables)) {
    root.addOption(table.name, {
      label: table.name,
      type: 'table',
      detail: 'table',
      boost: 1,
    });

    root.addChild(
      table.name,
      buildTableCompletionTree(table, dialect, keywords),
    );
  }

  return root;
}

function escapeConflictedId(
  dialect: SQLDialectSpec,
  label: string,
  keywords: Record<string, boolean>,
): string {
  if (keywords[label.toLowerCase()])
    return `${dialect.identifierQuotes}${label}${dialect.identifierQuotes}`;
  return label;
}

function buildCompletionTree(
  schema: DatabaseSchemaList | undefined,
  currentDatabase: string | undefined,
  dialect: SQLDialectSpec,
  keywords: Record<string, boolean>,
): SchemaCompletionTree {
  const root: SchemaCompletionTree = new SchemaCompletionTree();
  if (!schema) return root;

  // Build current database table list
  if (currentDatabase && schema[currentDatabase]) {
    for (const table of Object.values(schema[currentDatabase].tables)) {
      root.addOption(table.name, {
        label: table.name,
        apply: escapeConflictedId(dialect, table.name, keywords),
        type: 'table',
        detail: 'table',
        boost: 1,
      });

      root.addChild(
        table.name,
        buildTableCompletionTree(table, dialect, keywords),
      );
    }
  }

  for (const database of Object.values(schema)) {
    root.addOption(database.name, {
      label: database.name,
      apply: escapeConflictedId(dialect, database.name, keywords),
      type: 'property',
      detail: 'database',
    });

    root.addChild(
      database.name,
      buildDatabaseCompletionTree(database, dialect, keywords),
    );
  }

  return root;
}
export default class SchemaCompletionTree {
  protected options: Record<string, Completion> = {};
  protected child: Record<string, SchemaCompletionTree> = {};
  protected keywords: Record<string, boolean> = {};

  static build(
    schema: DatabaseSchemaList | undefined,
    currentDatabase: string | undefined,
    dialect: SQLDialectSpec,
  ) {
    const keywords = (dialect.keywords + ' ' + dialect.builtin)
      .split(' ')
      .filter(Boolean)
      .map((s) => s.toLowerCase());

    const keywordDict = keywords.reduce(
      (a, keyword) => {
        a[keyword] = true;
        return a;
      },
      {} as Record<string, boolean>,
    );

    return buildCompletionTree(schema, currentDatabase, dialect, keywordDict);
  }

  getLength() {
    return Object.keys(this.options).length;
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
