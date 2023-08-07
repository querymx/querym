import { SyntaxNode } from '@lezer/common';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { EnumSchema } from 'renderer/screens/DatabaseScreen/QueryWindow';

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

function searchForIdentifier(
  context: CompletionContext,
  node: SyntaxNode
): string | null {
  let currentNode = node.prevSibling;
  while (currentNode) {
    if (['CompositeIdentifier', 'Identifier'].includes(currentNode.type.name)) {
      return getNodeString(context, currentNode);
    } else if (!allowNodeWhenSearchForIdentify(context, node)) {
      return null;
    }

    currentNode = node.prevSibling;
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
    if (column) {
      // normally column will be enum
      return tempEnum.column === column;
    } else {
      // when column is a keyword, the node will be counted as 2
      // so there will be no column, the enum will be in table variable instead
      return tempEnum.column === table;
    }
  })?.values;

  if (!enumValues) return null;

  const options: CompletionResult['options'] = enumValues.map((value) => ({
    label: value,
    displayLabel: value,
    type: 'keyword',
  }));

  return {
    from: node.from + 1,
    to: node.to - 1,
    options,
  };
}

export default function handleCustomSqlAutoComplete(
  context: CompletionContext,
  tree: SyntaxNode,
  enumSchema: EnumSchema
): CompletionResult | null {
  // dont run if there is no enumSchema
  if (enumSchema.length === 0) return null;

  return handleEnumAutoComplete(context, tree, enumSchema);
}
