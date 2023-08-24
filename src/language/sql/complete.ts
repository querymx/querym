import {
  CompletionContext,
  CompletionResult,
  CompletionSource,
  completeFromList,
  ifNotIn,
} from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { Type, Keyword } from './sql.grammar.terms';

export function completeGeneric(
  handler: (
    context: CompletionContext,
    tree: SyntaxNode
  ) => CompletionResult | null
): CompletionSource {
  return (context: CompletionContext) => {
    const tree = syntaxTree(context.state);
    return handler(context, tree.resolveInner(context.pos, 0));
  };
}

export function completeKeywords(
  keywords: { [name: string]: number },
  upperCase: boolean
) {
  let completions = Object.keys(keywords).map((keyword) => ({
    label: upperCase ? keyword.toUpperCase() : keyword,
    type:
      keywords[keyword] == Type
        ? 'type'
        : keywords[keyword] == Keyword
        ? 'keyword'
        : 'variable',
    boost: -1,
  }));
  return ifNotIn(
    [
      'QuotedIdentifier',
      'SpecialVar',
      'String',
      'LineComment',
      'BlockComment',
      '.',
    ],
    completeFromList(completions)
  );
}
