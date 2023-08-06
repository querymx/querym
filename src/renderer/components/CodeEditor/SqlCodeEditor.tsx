import CodeMirror, {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import {
  acceptCompletion,
  completionStatus,
  startCompletion,
  autocompletion,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete';
import { defaultKeymap, insertTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { Ref, forwardRef, useCallback } from 'react';
import useCodeEditorTheme from './useCodeEditorTheme';
import type { EnumSchema } from 'renderer/screens/DatabaseScreen/QueryWindow';
import { SyntaxNode } from '@lezer/common';
import {
  SQLConfig,
  sql,
  MySQL,
  genericCompletion,
  keywordCompletionSource,
  schemaCompletionSource,
} from 'query-master-lang-sql';

const SqlCodeEditor = forwardRef(function SqlCodeEditor(
  props: ReactCodeMirrorProps & {
    schema: SQLConfig['schema'];
    enumSchema: EnumSchema;
  },
  ref: Ref<ReactCodeMirrorRef>
) {
  const { schema, enumSchema, ...codeMirrorProps } = props;
  const theme = useCodeEditorTheme();

  const enumCompletion = useCallback(
    (context: CompletionContext, tree: SyntaxNode): CompletionResult | null => {
      // dont run if there is no enumSchema
      if (enumSchema.length === 0) return null;

      const isEqualOperator = tree.prevSibling;

      // check if it's an operator and id is 15
      if (
        !(
          isEqualOperator?.type.name === 'Operator' &&
          isEqualOperator?.type.id === 15
        )
      )
        return null;

      // get the column name before the equal operator node
      const tableAndColumnNode = isEqualOperator?.prevSibling;
      if (!tableAndColumnNode) return null;

      // get the text from tableAndColumnNode
      // first convert context.state.doc to string
      // then slice from node.from to node.to
      const tableAndColumnText = context.state.doc
        .toString()
        .slice(tableAndColumnNode.from, tableAndColumnNode.to);

      // split the text to table and column
      const [table, column] = tableAndColumnText.replaceAll('`', '').split('.');
      // only check for table since column is possibly a keyword
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
        from: tree.from + 1,
        options,
      };
    },
    [enumSchema]
  );

  return (
    <CodeMirror
      ref={ref}
      theme={theme}
      indentWithTab={false}
      basicSetup={{ defaultKeymap: false, completionKeymap: false }}
      extensions={[
        keymap.of([
          {
            key: 'Tab',
            preventDefault: true,
            run: (target) => {
              if (completionStatus(target.state) === 'active') {
                acceptCompletion(target);
              } else {
                insertTab(target);
              }
              return true;
            },
          },
          {
            key: 'Ctrl-Space',
            mac: 'Cmd-i',
            preventDefault: true,
            run: startCompletion,
          },
          ...defaultKeymap,
        ]),
        sql({
          dialect: MySQL,
        }),
        autocompletion({
          override: [
            keywordCompletionSource(MySQL),
            schemaCompletionSource({ schema }),
            genericCompletion(enumCompletion),
          ],
        }),
      ]}
      {...codeMirrorProps}
    />
  );
});

export default SqlCodeEditor;
