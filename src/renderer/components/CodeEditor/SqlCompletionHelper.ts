import { CompletionContext } from '@codemirror/autocomplete';
import { SyntaxNode } from '@lezer/common';
import {
  DatabaseSchemaList,
  TableColumnSchema,
  TableSchema,
} from 'types/SqlSchema';

function getNodeString(context: CompletionContext, node: SyntaxNode) {
  return context.state.doc.sliceString(node.from, node.to);
}

export default class SqlCompletionHelper {
  /**
   *
   */
  static trimIdentifier(id: string) {
    return id.replaceAll('`', '');
  }

  static getColumnFromIdentifier(
    schema: DatabaseSchemaList,
    currentDatabase: string | undefined,
    exposedTables: TableSchema[],
    identifier: string
  ): TableColumnSchema | undefined {
    return this.getColumnFromIdentifierPath(
      schema,
      currentDatabase,
      exposedTables,
      identifier.split('.').map(this.trimIdentifier)
    );
  }

  static getColumnFromIdentifierPath(
    schema: DatabaseSchemaList,
    currentDatabase: string | undefined,
    exposedTables: TableSchema[],
    path: string[]
  ): TableColumnSchema | undefined {
    if (path.length === 1) {
      return exposedTables
        .map((table) => Object.values(table.columns))
        .flat()
        .find((column) => column.name === path[0]);
    } else if (
      path.length === 2 &&
      currentDatabase &&
      schema[currentDatabase]
    ) {
      // This is tableName.columnName
      const [tableName, columnName] = path;
      return schema[currentDatabase]?.tables[tableName]?.columns[columnName];
    } else if (path.length === 3) {
      // This is databaseName.tableName.columnName
      const [databaseName, tableName, columnName] = path;
      return schema[databaseName]?.tables[tableName]?.columns[columnName];
    }
  }

  /**
   * Giving the identifier and schema, we will get the table schema back.
   * For example: databaseA.tableA will search for tableA in databaseA.
   *
   * @param schema
   * @param identifer
   */
  static getTableFromIdentifier(
    schema: DatabaseSchemaList,
    currentDatabase: string | undefined,
    identifier: string
  ): TableSchema | null {
    return this.getTableFromIdentifierPath(
      schema,
      currentDatabase,
      identifier.split('.').map(this.trimIdentifier)
    );
  }

  static getTableFromIdentifierPath(
    schema: DatabaseSchemaList,
    currentDatabase: string | undefined,
    path: string[]
  ): TableSchema | null {
    if (path.length === 0) return null;
    if (path.length > 2) return null;

    if (path.length === 1 && currentDatabase && schema[currentDatabase])
      return schema[currentDatabase].tables[path[0]] || null;

    if (path.length === 2 && schema[path[0]]) {
      return schema[path[0]].tables[path[1]] || null;
    }

    return null;
  }

  /**
   * Detect if we are inside the table section. For example
   * SELECT * FROM tableA | <-- this is inside FROM section
   * SELECT * FROM tableA WHERE id = |  <-- this is not inside
   *
   * @param context
   * @param node
   * @returns
   */
  static isInsideFrom(context: CompletionContext, node: SyntaxNode): boolean {
    let ptr: SyntaxNode | null = node;
    while (ptr) {
      const currentString = getNodeString(context, ptr);

      if (
        ptr.type.name === 'Keyword' &&
        ['WHERE', 'GROUP', 'HAVING', 'ORDER', 'LIMIT', 'FOR'].includes(
          currentString.toUpperCase()
        )
      ) {
        return false;
      }

      if (
        ptr.type.name === 'Keyword' &&
        currentString.toUpperCase() === 'FROM'
      ) {
        return true;
      }

      ptr = ptr.prevSibling;
    }

    return false;
  }

  /**
   * Find the inner node of the tree from given position
   */
  static resolveInner(tree: SyntaxNode, pos: number): SyntaxNode | null {
    if (tree.from > pos || tree.to < pos) return null;

    let ptr = tree.firstChild;
    while (ptr) {
      const resolvedChild = SqlCompletionHelper.resolveInner(ptr, pos);
      if (resolvedChild) return resolvedChild;
      ptr = ptr.nextSibling;
    }

    return tree;
  }

  static fromTables(context: CompletionContext, node: SyntaxNode): string[] {
    const parent = node.type.name === 'Statement' ? node : node.parent;
    if (!parent) return [];
    if (!parent.firstChild) return [];

    const statementKeyword = getNodeString(
      context,
      parent.firstChild
    ).toUpperCase();

    // Check if it is SELECT statement.
    // There is no FROM if it is not SELECT statement
    if (statementKeyword !== 'SELECT') return [];

    let ptr: SyntaxNode | null = parent.firstChild;

    // Loop until we find FROM keyword
    while (ptr) {
      const currentString = getNodeString(context, ptr);
      if (
        ptr.type.name === 'Keyword' &&
        currentString.toUpperCase() === 'FROM'
      ) {
        break;
      }
      ptr = ptr.nextSibling;
    }

    // FROM is not found.
    if (!ptr) return [];

    // Collecting the table name until WHERE
    const tables: string[] = [];

    ptr = ptr.nextSibling;
    while (ptr) {
      const currentString = getNodeString(context, ptr);

      if (
        ptr.type.name === 'Keyword' &&
        ['WHERE', 'GROUP', 'HAVING', 'ORDER', 'LIMIT', 'FOR'].includes(
          currentString.toUpperCase()
        )
      ) {
        break;
      } else if (['QuotedIdentifier', 'Identifier'].includes(ptr.type.name)) {
        tables.push(currentString.replaceAll('`', ''));
      }

      ptr = ptr.nextSibling;
    }

    return tables;
  }
}
