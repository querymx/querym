import { CompletionContext } from '@codemirror/autocomplete';
import { SyntaxNode } from '@lezer/common';
import { DatabaseSchemas, TableSchema } from 'types/SqlSchema';

function getNodeString(context: CompletionContext, node: SyntaxNode) {
  return context.state.doc.sliceString(node.from, node.to);
}

export default class SqlCompletionHelper {
  /**
   * Giving the identifier and schema, we will get the table schema back.
   * For example: databaseA.tableA will search for tableA in databaseA.
   *
   * @param schema
   * @param identifer
   */
  static getTableFromIdentifier(
    schema: DatabaseSchemas,
    currentDatabase: string | undefined,
    identifier: string
  ): TableSchema | null {
    return this.getTableFromIdentifierPath(
      schema,
      currentDatabase,
      identifier.split('.')
    );
  }

  static getTableFromIdentifierPath(
    schema: DatabaseSchemas,
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
