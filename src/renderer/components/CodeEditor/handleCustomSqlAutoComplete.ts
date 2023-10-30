import { SyntaxNode } from '@lezer/common';
import {
  CompletionContext,
  CompletionResult,
  Completion,
} from '@codemirror/autocomplete';
import { DatabaseSchemaList, TableSchema } from 'types/SqlSchema';
import SchemaCompletionTree from './SchemaCompletionTree';
import SqlCompletionHelper from './SqlCompletionHelper';

function getNodeString(context: CompletionContext, node: SyntaxNode) {
  return context.state.doc.sliceString(node.from, node.to);
}

function allowNodeWhenSearchForIdentify(
  context: CompletionContext,
  node: SyntaxNode,
) {
  if (node.type.name === 'Operator') return true;
  if (node.type.name === 'Keyword') {
    return ['IN'].includes(getNodeString(context, node).toUpperCase());
  }
  return false;
}

function getIdentifierParentPath(
  context: CompletionContext,
  node: SyntaxNode | null,
): string[] {
  const result: string[] = [];
  let prev = node;

  while (prev) {
    if (prev.type.name !== '.') {
      const currentStr = getNodeString(context, prev).trim();
      if (currentStr[currentStr.length - 1] !== '.') break;
    } else {
      prev = prev.prevSibling;
      if (!prev) break;
    }

    if (
      !['Identifier', 'QuotedIdentifier', 'CompositeIdentifier'].includes(
        prev.type.name,
      )
    )
      break;

    result.push(getNodeString(context, prev).trim().replaceAll('.', ''));
    prev = prev.prevSibling;
  }

  result.reverse();
  return result.map(SqlCompletionHelper.trimIdentifier);
}

function searchForIdentifier(
  context: CompletionContext,
  node: SyntaxNode,
): string | null {
  let currentNode = node.prevSibling;
  while (currentNode) {
    if (['CompositeIdentifier', 'Identifier'].includes(currentNode.type.name)) {
      const maybeIdentifier = getNodeString(context, currentNode);
      if (maybeIdentifier[maybeIdentifier.length - 1] === '.') {
        // Maybe the identifier is not complete
        const nextNode = currentNode.nextSibling;
        if (nextNode && nextNode.type.name === 'Builtin') {
          return maybeIdentifier + getNodeString(context, nextNode);
        }
      }
      return maybeIdentifier;
    } else if (!allowNodeWhenSearchForIdentify(context, node)) {
      return null;
    }

    currentNode = currentNode.prevSibling;
  }

  return null;
}

function handleEnumAutoComplete(
  context: CompletionContext,
  node: SyntaxNode,
  schema: DatabaseSchemaList,
  currentDatabase: string | undefined,
  exposedTable: TableSchema[],
): CompletionResult | null {
  let currentNode = node;

  if (currentNode.type.name !== 'String') {
    return null;
  }

  // This will handle
  // SELECT * FROM tblA WHERE tblA.colA IN (....)
  if (currentNode?.parent?.type?.name === 'Parens') {
    currentNode = currentNode.parent;
  }

  if (!currentNode.prevSibling) return null;

  // Let search for identifer
  const identifier = searchForIdentifier(context, currentNode.prevSibling);
  if (!identifier) return null;

  const column = SqlCompletionHelper.getColumnFromIdentifier(
    schema,
    currentDatabase,
    exposedTable,
    identifier,
  );

  if (
    column &&
    column.dataType === 'enum' &&
    column.enumValues &&
    column.enumValues.length > 0
  ) {
    const options: CompletionResult['options'] = column.enumValues.map(
      (value) => ({
        label: value,
        type: 'enum',
        detail: 'enum',
      }),
    );

    return {
      from: node.from + 1,
      to: node.to - 1,
      options,
    };
  }

  return null;
}

function getSchemaSuggestionFromPath(
  tree: SchemaCompletionTree,
  path: string[],
) {
  if (tree.getLength() === 0) return [];

  let treeWalk: SchemaCompletionTree | undefined = tree;

  for (const currentPath of path) {
    if (treeWalk) treeWalk = treeWalk.getChild(currentPath);
  }

  if (treeWalk) {
    return treeWalk.getOptions();
  }

  return [];
}

export default function handleCustomSqlAutoComplete(
  context: CompletionContext,
  tree: SyntaxNode,
  schemaTree: SchemaCompletionTree,
  schema: DatabaseSchemaList | undefined,
  currentDatabase: string | undefined,
): CompletionResult | null {
  if (!schema) return null;

  if (tree.type.name === 'Script') {
    tree = tree.resolveInner(
      context.state.doc.sliceString(0, context.pos).trimEnd().length,
      -1,
    );
  }

  if (tree.type.name === 'Parens' || tree.type.name === 'Statement') {
    tree = SqlCompletionHelper.resolveInner(tree, context.pos) || tree;
  }

  console.log(tree);

  const currentSelectedTableNames = SqlCompletionHelper.fromTables(
    context,
    tree,
  );

  const currentSelectedTables = currentSelectedTableNames
    .map((tableName) =>
      SqlCompletionHelper.getTableFromIdentifier(
        schema,
        currentDatabase,
        tableName,
      ),
    )
    .filter(Boolean) as TableSchema[];

  const currentExposedColumns = currentSelectedTables
    .map((table) => Object.values(table.columns))
    .flat();

  let currentColumnCompletion: Completion[] = currentExposedColumns.map(
    (column) => ({
      label: column.name,
      type: 'property',
      detail: column.dataType,
      boost: 3,
    }),
  );

  if (SqlCompletionHelper.isInsideFrom(context, tree)) {
    currentColumnCompletion = [];
  }

  const enumSuggestion = handleEnumAutoComplete(
    context,
    tree,
    schema,
    currentDatabase,
    currentSelectedTables,
  );
  if (enumSuggestion) {
    return enumSuggestion;
  }

  if (
    ['Identifier', 'QuotedIdentifier', 'Keyword', 'Builtin'].includes(
      tree.type.name,
    )
  ) {
    return {
      from: tree.type.name === 'QuotedIdentifier' ? tree.from + 1 : tree.from,
      to: tree.type.name === 'QuotedIdentifier' ? tree.to - 1 : tree.to,
      validFor:
        tree.type.name === 'QuotedIdentifier' ? /^[`'"]?\w*[`'"]?$/ : /^\w*$/,
      options: [
        ...currentColumnCompletion,
        ...getSchemaSuggestionFromPath(
          schemaTree,
          getIdentifierParentPath(context, tree.prevSibling),
        ),
      ],
    };
  } else if (
    tree.type.name === '.' ||
    tree.type.name === 'CompositeIdentifier'
  ) {
    return {
      from: context.pos,
      validFor: /^\w*$/,
      options: [
        ...getSchemaSuggestionFromPath(
          schemaTree,
          getIdentifierParentPath(context, tree),
        ),
      ],
    };
  }

  if (!context.explicit) return null;

  return {
    from: context.pos,
    options: [
      ...currentColumnCompletion,
      ...getSchemaSuggestionFromPath(schemaTree, []),
    ],
    validFor: /^\w*$/,
  };
}
