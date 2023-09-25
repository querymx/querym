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
import { Ref, forwardRef, useCallback, useMemo } from 'react';
import useCodeEditorTheme from './useCodeEditorTheme';
import { SyntaxNode } from '@lezer/common';
import {
  sql,
  genericCompletion,
  keywordCompletionSource,
} from '../../../language/dist/';

import handleCustomSqlAutoComplete from './handleCustomSqlAutoComplete';
import { DatabaseSchemas } from 'types/SqlSchema';
import createSQLTableNameHighlightPlugin from './SQLTableNameHightlight';
import { functionTooltip } from './functionTooltips';
import { MySQLDialect, MySQLTooltips } from 'dialects/MySQLDialect';
import { QueryDialetType } from 'libs/QueryBuilder';
import { PgDialect, PgTooltips } from 'dialects/PgDialect copy';

const SqlCodeEditor = forwardRef(function SqlCodeEditor(
  props: ReactCodeMirrorProps & {
    schema?: DatabaseSchemas;
    currentDatabase?: string;
    dialect: QueryDialetType;
  },
  ref: Ref<ReactCodeMirrorRef>
) {
  const { schema, currentDatabase, ...codeMirrorProps } = props;
  const theme = useCodeEditorTheme();

  const customAutoComplete = useCallback(
    (context: CompletionContext, tree: SyntaxNode): CompletionResult | null => {
      return handleCustomSqlAutoComplete(
        context,
        tree,
        schema?.getSchema(),
        currentDatabase
      );
    },
    [schema, currentDatabase]
  );

  const tableNameHighlightPlugin = useMemo(() => {
    if (schema && currentDatabase) {
      return createSQLTableNameHighlightPlugin(
        Object.keys(schema.getTableList(currentDatabase))
      );
    }
    return createSQLTableNameHighlightPlugin([]);
  }, [schema, currentDatabase]);

  const dialect = props.dialect === 'mysql' ? MySQLDialect : PgDialect;
  const tooltips = props.dialect === 'mysql' ? MySQLTooltips : PgTooltips;

  return (
    <CodeMirror
      tabIndex={0}
      ref={ref}
      autoFocus
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
          dialect,
        }),
        autocompletion({
          override: [
            genericCompletion(customAutoComplete),
            keywordCompletionSource(dialect, true),
          ],
        }),
        indentUnit.of('  '),
        tableNameHighlightPlugin,
        functionTooltip(tooltips),
      ]}
      {...codeMirrorProps}
    />
  );
});

export default SqlCodeEditor;
