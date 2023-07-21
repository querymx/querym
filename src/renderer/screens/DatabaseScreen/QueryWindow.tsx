import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import Toolbar from 'renderer/components/Toolbar';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import Splitter from 'renderer/components/Splitter/Splitter';
import { SqlStatementRowBasedResult } from 'libs/SqlRunnerManager';
import { splitQuery } from 'dbgate-query-splitter';
import QueryMultipleResultViewer from './QueryMultipleResultViewer';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import { useDialog } from 'renderer/contexts/DialogProvider';
import SqlCodeEditor from 'renderer/components/CodeEditor/SqlCodeEditor';
import QueryWindowNameEditor from './QueryWindowNameEditor';
import Stack from 'renderer/components/Stack';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryResultLoading from './QueryResultViewer/QueryResultLoading';
import {
  transformResultHeaderUseSchema,
  transformResultToRowBasedResult,
} from 'libs/TransformResult';

interface QueryWindowProps {
  initialSql?: string;
  initialRun?: boolean;
  tabKey: string;
  name: string;
}

export default function QueryWindow({
  initialSql,
  initialRun,
  tabKey,
}: QueryWindowProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const { selectedTab, setTabData, saveWindowTabHistory } = useWindowTab();
  const { runner } = useSqlExecute();
  const { showErrorDialog } = useDialog();
  const [result, setResult] = useState<SqlStatementRowBasedResult[]>([]);
  const [queryKeyCounter, setQueryKeyCounter] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const executeSql = useCallback(
    (code: string, skipProtection?: boolean) => {
      saveWindowTabHistory();
      const splittedSql = splitQuery(code);

      runner
        .execute(
          splittedSql.map((sql) => ({ sql: sql.toString() })),
          {
            onStart: () => setLoading(true),
            skipProtection,
          }
        )
        .then((r) => {
          setResult(
            transformResultToRowBasedResult(
              transformResultHeaderUseSchema(r, schema)
            )
          );
          setQueryKeyCounter((prev) => prev + 1);
        })
        .catch((e) => {
          if (e.message) {
            showErrorDialog(e.message);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [runner, setResult, schema, setLoading, saveWindowTabHistory]
  );

  const onRun = useCallback(() => {
    if (editorRef.current) {
      const sqlCode = editorRef.current.view?.state.doc.toString() || '';
      executeSql(sqlCode);
    }
  }, [executeSql, editorRef]);

  useEffect(() => {
    if (selectedTab === tabKey) {
      const onKeyBinding = (e: KeyboardEvent) => {
        if (e.key === 'F9') {
          onRun();
        }
      };

      document.addEventListener('keydown', onKeyBinding);
      return () => document.removeEventListener('keydown', onKeyBinding);
    }
  }, [onRun, selectedTab, tabKey]);

  useEffect(() => {
    if (initialRun && initialSql) {
      executeSql(initialSql, true);
    }
    // DANGEROUSLY:
    // Do not add any dependencies as we only want
    // it to run only ONCE. executeSql did change
    // when we switch database and might cause it to
    // run the query again
  }, []);

  useEffect(() => {
    setTabData(tabKey, { sql: initialSql, type: 'query' });
  }, [tabKey, setTabData, initialSql]);

  return (
    <Splitter vertical primaryIndex={1} secondaryInitialSize={200}>
      <div className={styles.queryContainer}>
        <div>
          <Stack spacing="none">
            <QueryWindowNameEditor tabKey={tabKey} />
            <Toolbar>
              <Toolbar.Item
                icon={<FontAwesomeIcon icon={faPlay} />}
                text="Run (F9)"
                onClick={onRun}
              />
            </Toolbar>
          </Stack>
        </div>

        <div className={styles.queryEditor}>
          <SqlCodeEditor
            ref={editorRef}
            onContextMenu={handleContextMenu}
            style={{ fontSize: 20, height: '100%' }}
            value={code}
            onChange={(newCode) => {
              setCode(newCode);
              setTabData(tabKey, { sql: newCode, type: 'query' });
            }}
            height="100%"
            schema={codeMirrorSchema}
          />
        </div>
      </div>
      <div style={{ height: '100%' }}>
        {loading ? (
          <QueryResultLoading />
        ) : (
          <QueryMultipleResultViewer key={queryKeyCounter} value={result} />
        )}
      </div>
    </Splitter>
  );
}
