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
import { indentUnit } from '@codemirror/language';
import { defaultKeymap, insertTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { Ref, forwardRef, useCallback } from 'react';
import useCodeEditorTheme from './useCodeEditorTheme';
import { SyntaxNode } from '@lezer/common';
import {
  sql,
  MySQL,
  genericCompletion,
  keywordCompletionSource,
} from '../../../language/dist/';
import handleCustomSqlAutoComplete from './handleCustomSqlAutoComplete';
import { DatabaseSchemas } from 'types/SqlSchema';

const SqlCodeEditor = forwardRef(function SqlCodeEditor(
  props: ReactCodeMirrorProps & {
    schema?: DatabaseSchemas;
    currentDatabase?: string;
  },
  ref: Ref<ReactCodeMirrorRef>
) {
  const { schema, currentDatabase, ...codeMirrorProps } = props;
  const theme = useCodeEditorTheme();

  const enumCompletion = useCallback(
    (context: CompletionContext, tree: SyntaxNode): CompletionResult | null => {
      return handleCustomSqlAutoComplete(
        context,
        tree,
        schema,
        currentDatabase
      );
    },
    [schema, currentDatabase]
  );

  return (
    <CodeMirror
      ref={ref}
      theme={theme}
      indentWithTab={false}
      basicSetup={{
        defaultKeymap: false,
        completionKeymap: false,
        drawSelection: false,
      }}
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
            genericCompletion(enumCompletion),
          ],
        }),
        indentUnit.of('  '),
      ]}
      {...codeMirrorProps}
    />
  );
});

export default SqlCodeEditor;
