import { SyntaxNode } from '@lezer/common';
import {
  CompletionContext,
  CompletionResult,
  Completion,
} from '@codemirror/autocomplete';
import { EnumSchema } from 'renderer/screens/DatabaseScreen/QueryWindow';
import { DatabaseSchemas, TableSchema } from 'types/SqlSchema';
import SchemaCompletionTree from './SchemaCompletionTree';
import SqlCompletionHelper from './SqlCompletionHelper';

function getNodeString(context: CompletionContext, node: SyntaxNode) {
  return context.state.doc.sliceString(node.from, node.to);
}

function allowNodeWhenSearchForIdentify(
  context: CompletionContext,
  node: SyntaxNode
) {
  if (node.type.name === 'Operator') return true;
  if (node.type.name === 'Keyword') {
    return ['IN'].includes(getNodeString(context, node).toUpperCase());
  }
  return false;
}

function getIdentifierParentPath(
  context: CompletionContext,
  node: SyntaxNode | null
): string[] {
  const result: string[] = [];
  let prev = node;

  while (prev) {
    if (prev.type.name !== '.') break;

    prev = prev.prevSibling;
    if (!prev) break;

    if (
      !['Identifier', 'QuotedIdentifer', 'CompositeIdentifier'].includes(
        prev.type.name
      )
    )
      break;
    result.push(getNodeString(context, prev).replaceAll('.', ''));
    prev = prev.prevSibling;
  }

  result.reverse();
  return result;
}

function searchForIdentifier(
  context: CompletionContext,
  node: SyntaxNode
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
  enumSchema: EnumSchema
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

  const [table, column] = identifier.replaceAll('`', '').split('.');
  if (!table) return null;

  const enumValues = enumSchema.find((tempEnum) => {
    return tempEnum.column === column && table === tempEnum.table;
  })?.values;

  if (!enumValues) return null;

  const options: CompletionResult['options'] = enumValues.map((value) => ({
    label: value,
    type: 'enum',
    detail: 'enum',
  }));

  return {
    from: node.from + 1,
    to: node.to - 1,
    options,
  };
}

function getSchemaSuggestionFromPath(
  schema: DatabaseSchemas | undefined,
  currentDatabase: string | undefined,
  path: string[]
) {
  if (!schema) return [];

  const tree = SchemaCompletionTree.build(schema, currentDatabase);
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
  schema: DatabaseSchemas | undefined,
  currentDatabase: string | undefined,
  enumSchema: EnumSchema
): CompletionResult | null {
  // dont run if there is no enumSchema
  if (enumSchema.length === 0) return null;
  if (!schema) return null;

  if (tree.type.name === 'Script') {
    tree = tree.resolveInner(
      context.state.doc.sliceString(0, context.pos).trimEnd().length,
      -1
    );
  }

  if (tree.type.name === 'Parens' || tree.type.name === 'Statement') {
    tree = SqlCompletionHelper.resolveInner(tree, context.pos) || tree;
  }
  console.log(tree);

  const currentSelectedTableNames = SqlCompletionHelper.fromTables(
    context,
    tree
  );

  const currentSelectedTables = currentSelectedTableNames
    .map((tableName) =>
      SqlCompletionHelper.getTableFromIdentifier(
        schema,
        currentDatabase,
        tableName
      )
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
    })
  );

  if (SqlCompletionHelper.isInsideFrom(context, tree)) {
    currentColumnCompletion = [];
  }

  const enumSuggestion = handleEnumAutoComplete(context, tree, enumSchema);
  if (enumSuggestion) {
    return enumSuggestion;
  }

  if (tree.type.name === 'Identifier') {
    return {
      from: tree.from,
      to: tree.to,
      validFor: /^\w*$/,
      options: [
        ...currentColumnCompletion,
        ...getSchemaSuggestionFromPath(
          schema,
          currentDatabase,
          getIdentifierParentPath(context, tree.prevSibling)
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
        ...currentColumnCompletion,
        ...getSchemaSuggestionFromPath(
          schema,
          currentDatabase,
          getIdentifierParentPath(context, tree)
        ),
      ],
    };
  }

  if (!context.explicit) return null;

  return {
    from: context.pos,
    options: [
      ...currentColumnCompletion,
      ...getSchemaSuggestionFromPath(schema, currentDatabase, []),
    ],
    validFor: /^\w*$/,
  };
}
