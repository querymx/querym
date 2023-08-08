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
import handleCustomSqlAutoComplete from './handleCustomSqlAutoComplete';

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
      return handleCustomSqlAutoComplete(context, tree, enumSchema);
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
            keywordCompletionSource(MySQL, true),
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
