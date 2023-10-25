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
import { useKeybinding } from 'renderer/contexts/KeyBindingProvider';
import SchemaCompletionTree from './SchemaCompletionTree';

const SqlCodeEditor = forwardRef(function SqlCodeEditor(
  props: ReactCodeMirrorProps & {
    schema?: DatabaseSchemas;
    currentDatabase?: string;
    dialect: QueryDialetType;
  },
  ref: Ref<ReactCodeMirrorRef>,
) {
  const { schema, currentDatabase, ...codeMirrorProps } = props;
  const { binding } = useKeybinding();
  const theme = useCodeEditorTheme();

  const dialect = props.dialect === 'mysql' ? MySQLDialect : PgDialect;
  const tooltips = props.dialect === 'mysql' ? MySQLTooltips : PgTooltips;

  const schemaTree = useMemo(() => {
    return SchemaCompletionTree.build(
      schema?.getSchema(),
      currentDatabase,
      dialect.spec,
    );
  }, [schema, currentDatabase, dialect]);

  const customAutoComplete = useCallback(
    (context: CompletionContext, tree: SyntaxNode): CompletionResult | null => {
      return handleCustomSqlAutoComplete(
        context,
        tree,
        schemaTree,
        schema?.getSchema(),
        currentDatabase,
      );
    },
    [schema, schemaTree, currentDatabase],
  );

  const tableNameHighlightPlugin = useMemo(() => {
    if (schema && currentDatabase) {
      return createSQLTableNameHighlightPlugin(
        Object.keys(schema.getTableList(currentDatabase)),
      );
    }
    return createSQLTableNameHighlightPlugin([]);
  }, [schema, currentDatabase]);

  const keyExtension = useMemo(() => {
    return keymap.of([
      // Prevent the default behavior if it matches any of
      // these key binding. The reason is because the default
      // key binding for run is Ctrl + Enter. It is weird if
      // press Ctrl + Enter, will run and also insert newline
      // at the same time.
      ...[
        binding['run-current-query'],
        binding['run-query'],
        binding['save-query'],
      ].map((binding) => ({
        key: binding.toCodeMirrorKey(),
        preventDefault: true,
        run: () => true,
      })),
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
    ]);
  }, [binding]);

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
        keyExtension,
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
