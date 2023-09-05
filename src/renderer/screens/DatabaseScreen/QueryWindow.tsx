import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faICursor } from '@fortawesome/free-solid-svg-icons';
import { format } from 'sql-formatter';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import Toolbar from 'renderer/components/Toolbar';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import Splitter from 'renderer/components/Splitter/Splitter';
import { splitQuery } from 'dbgate-query-splitter';
import QueryMultipleResultViewer from './QueryMultipleResultViewer';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import { useDialog } from 'renderer/contexts/DialogProvider';
import SqlCodeEditor from 'renderer/components/CodeEditor/SqlCodeEditor';
import Stack from 'renderer/components/Stack';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryResultLoading from './QueryResultViewer/QueryResultLoading';
import { transformResultHeaderUseSchema } from 'libs/TransformResult';
import { SqlStatementResult } from 'libs/SqlRunnerManager';
import { EditorState } from '@codemirror/state';
import { useSavedQueryPubSub } from './SavedQueryProvider';
import QueryHeader from './QueryHeader';

export type EnumSchema = Array<{
  table: string;
  column: string;
  values: string[];
}>;

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

  const [loading, setLoading] = useState(false);
  const [queryKeyCounter, setQueryKeyCounter] = useState(0);
  const [result, setResult] = useState<SqlStatementResult[]>([]);
  const { publish } = useSavedQueryPubSub();

  const { runner } = useSqlExecute();
  const { showErrorDialog } = useDialog();
  const { schema, currentDatabase } = useSchema();
  const { selectedTab, tabs, setTabData, saveWindowTabHistory } =
    useWindowTab();

  const currentTab = useMemo(() => {
    return tabs.find((tab) => tab.key === tabKey);
  }, [tabKey, tabs]);

  const [code, setCode] = useState(initialSql || '');

  const { handleContextMenu } = useContextMenu(() => {
    const view = editorRef?.current?.view;
    const viewState = view?.state;
    const selectFrom = viewState?.selection?.main?.from || 0;
    const selectTo = viewState?.selection?.main?.to || 0;

    return [
      {
        text: 'Beautify SQL',
        onClick: () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const codeFromRef: string = (viewState?.doc as any).text.join('\r');
          setCode(format(codeFromRef));
        },
        separator: true,
      },
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
  }, [editorRef, setCode]);

  const getSelection = useCallback(() => {
    const es = editorRef.current?.view?.state as EditorState;
    if (!es) return '';
    return es.sliceDoc(es.selection.main.from, es.selection.main.to);
  }, []);

  const getText = useCallback(() => {
    if (!editorRef.current) return '';
    return editorRef.current.view?.state.doc.toString() || '';
  }, []);

  const savedQuery = useCallback(() => {
    if (currentTab) {
      publish({ id: currentTab.key, name: currentTab.name, sql: getText() });
    }
  }, [getText, currentTab]);

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
          setResult(transformResultHeaderUseSchema(r, schema));
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

  const onRun = useCallback(
    (sqlCode: string) => {
      if (!editorRef.current || sqlCode === '') return;
      executeSql(sqlCode);
    },
    [executeSql, editorRef]
  );

  useEffect(() => {
    if (selectedTab === tabKey) {
      const onKeyBinding = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'F9') {
          onRun(getSelection());
        } else if (e.key === 'F9') {
          onRun(getText());
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
        <QueryHeader tabKey={tabKey} onSave={savedQuery} />

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
            schema={schema}
            currentDatabase={currentDatabase}
          />
        </div>

        <div>
          <Toolbar>
            <Toolbar.Item
              icon={<FontAwesomeIcon icon={faPlay} />}
              text="Run (F9)"
              onClick={() => onRun(getText())}
            />
            <Toolbar.Item
              icon={
                <Stack spacing="none" center>
                  <FontAwesomeIcon icon={faPlay} style={{ paddingRight: 3 }} />
                  <FontAwesomeIcon
                    icon={faICursor}
                    style={{ height: 11, color: 'black' }}
                  />
                </Stack>
              }
              text="Run Selection (Ctrl + F9)"
              onClick={() => onRun(getSelection())}
            />
          </Toolbar>
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
