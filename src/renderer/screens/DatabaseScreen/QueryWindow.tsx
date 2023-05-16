import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import Toolbar from 'renderer/components/Toolbar';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import Splitter from 'renderer/components/Splitter/Splitter';
import { SqlProtectionLevel, SqlStatementResult } from 'libs/SqlRunnerManager';
import { splitQuery } from 'dbgate-query-splitter';
import QueryMultipleResultViewer from './QueryMultipleResultViewer';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';

const theme = createTheme({
  theme: 'light',
  settings: {
    background: '#ffffff',
    foreground: '#000',
    caret: '#AEAFAD',
    selection: '#f1c40f',
    selectionMatch: '#f1c40f',
    gutterBackground: '#FFFFFF',
    gutterForeground: '#4D4D4C',
    gutterBorder: '#fff',
    gutterActiveForeground: '#000',
  },
  styles: [
    { tag: t.keyword, color: '#2980b9' },
    { tag: t.comment, color: '#27ae60' },
    { tag: t.definition(t.typeName), color: '#27ae60' },
    { tag: t.typeName, color: '#194a7b' },
    { tag: t.tagName, color: '#008a02' },
    { tag: t.variableName, color: '#1a00db' },
  ],
});

interface QueryWindowProps {
  initialSql?: string;
  initialRun?: boolean;
}

export default function QueryWindow({
  initialSql,
  initialRun,
}: QueryWindowProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const { runner } = useSqlExecute();
  const [result, setResult] = useState<SqlStatementResult[]>([]);
  const [queryKeyCounter, setQueryKeyCounter] = useState(0);
  const { schema, currentDatabase } = useSchmea();
  const codeMirrorSchema = useMemo(() => {
    return currentDatabase && schema
      ? Object.values(schema[currentDatabase].tables).reduce(
          (prev, current) => ({
            ...prev,
            [current.name]: Object.keys(current.columns),
          }),
          {}
        )
      : {};
  }, [schema, currentDatabase]);
  const [code, setCode] = useState(initialSql || '');

  const { handleContextMenu } = useContextMenu(() => {
    const view = editorRef?.current?.view;
    const viewState = view?.state;
    const selectFrom = viewState?.selection?.main?.from || 0;
    const selectTo = viewState?.selection?.main?.to || 0;

    return [
      { text: 'Beautify SQL', separator: true },
      {
        text: 'Cut',
        hotkey: 'Ctrl + X',
        onClick: () => {
          if (viewState) {
            window.navigator.clipboard.writeText(
              viewState.sliceDoc(selectFrom, selectTo)
            );
            view.dispatch({
              changes: { from: selectFrom, to: selectTo, insert: '' },
            });
            view.focus();
          }
        },
        disabled: selectFrom === selectTo,
      },
      {
        text: 'Copy',
        hotkey: 'Ctrl + C',
        onClick: () => {
          if (viewState) {
            window.navigator.clipboard.writeText(
              viewState.sliceDoc(selectFrom, selectTo)
            );
            view.focus();
          }
        },
        disabled: selectFrom === selectTo,
      },
      {
        text: 'Paste',
        hotkey: 'Ctrl + V',
        onClick: async () => {
          if (viewState) {
            const pasteText = await window.navigator.clipboard.readText();
            view.dispatch({
              changes: { from: selectFrom, to: selectTo, insert: pasteText },
            });
            view.focus();
          }
        },
      },
    ];
  }, [editorRef]);

  const onRun = useCallback(() => {
    const splittedSql = splitQuery(code);

    runner
      .execute(
        SqlProtectionLevel.NeedConfirm,
        splittedSql.map((sql) => ({ sql: sql.toString() }))
      )
      .then((r) => {
        setResult(r);
        setQueryKeyCounter((prev) => prev + 1);
      })
      .catch(console.error);
  }, [runner, setResult, code]);

  useEffect(() => {
    if (initialRun && initialSql) {
      runner
        .execute(SqlProtectionLevel.NeedConfirm, [{ sql: initialSql }])
        .then((r) => {
          setResult(r);
          setQueryKeyCounter((prev) => prev + 1);
        })
        .catch(console.error);
    }
  }, [runner, initialRun, setResult, initialSql]);

  return (
    <Splitter vertical primaryIndex={1} secondaryInitialSize={200}>
      <div className={styles.queryContainer}>
        <div>
          <Toolbar>
            <Toolbar.Item
              icon={<FontAwesomeIcon icon={faPlay} />}
              text="Run"
              onClick={onRun}
            />
          </Toolbar>
        </div>

        <div className={styles.queryEditor}>
          <CodeMirror
            ref={editorRef}
            onContextMenu={handleContextMenu}
            style={{ fontSize: 20, height: '100%' }}
            value={code}
            onChange={(newCode) => setCode(newCode)}
            height="100%"
            theme={theme}
            extensions={[
              sql({
                schema: codeMirrorSchema,
              }),
            ]}
          />
        </div>
      </div>
      <div style={{ height: '100%' }}>
        <QueryMultipleResultViewer key={queryKeyCounter} value={result} />
      </div>
    </Splitter>
  );
}
