import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
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
import { useDialog } from 'renderer/contexts/DialogProvider';
import SqlCodeEditor from 'renderer/components/CodeEditor/SqlCodeEditor';

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
  const { showErrorDialog } = useDialog();
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
      .catch((e) => {
        if (e.message) {
          showErrorDialog(e.message);
        }
      });
  }, [runner, setResult, code]);

  useEffect(() => {
    if (initialRun && initialSql) {
      runner
        .execute(SqlProtectionLevel.None, [{ sql: initialSql }])
        .then((r) => {
          setResult(r);
          setQueryKeyCounter((prev) => prev + 1);
        })
        .catch(console.error);
    }
  }, [runner, initialRun, setResult, initialSql, showErrorDialog]);

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
          <SqlCodeEditor
            ref={editorRef}
            onContextMenu={handleContextMenu}
            style={{ fontSize: 20, height: '100%' }}
            value={code}
            onChange={(newCode) => setCode(newCode)}
            height="100%"
            schema={codeMirrorSchema}
          />
        </div>
      </div>
      <div style={{ height: '100%' }}>
        <QueryMultipleResultViewer key={queryKeyCounter} value={result} />
      </div>
    </Splitter>
  );
}
