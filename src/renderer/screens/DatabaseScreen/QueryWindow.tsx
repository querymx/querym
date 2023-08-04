import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faICursor,
  faTable,
  faCircleExclamation,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons';
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
import SqlCodeEditor from 'renderer/components/CodeEditor/SqlCodeEditor';
import QueryWindowNameEditor from './QueryWindowNameEditor';
import Stack from 'renderer/components/Stack';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryResultLoading from './QueryResultViewer/QueryResultLoading';
import { transformResultHeaderUseSchema } from 'libs/TransformResult';
import { SqlStatementResult } from 'libs/SqlRunnerManager';
import { EditorState } from '@codemirror/state';

interface QueryWindowProps {
  initialSql?: string;
  initialRun?: boolean;
  tabKey: string;
  name: string;
}

const ErrorPanel = ({ error }: { error?: string }) => {
  return <div className={styles.errorPanel}>{error}</div>;
};

enum Panel {
  RESULT = 'result',
  ERROR = 'error',
}

export default function QueryWindow({
  initialSql,
  initialRun,
  tabKey,
}: QueryWindowProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const { selectedTab, setTabData, saveWindowTabHistory } = useWindowTab();
  const { runner } = useSqlExecute();
  const [result, setResult] = useState<SqlStatementResult[]>([]);
  const [queryKeyCounter, setQueryKeyCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<Panel>(Panel.RESULT);
  const [error, setError] = useState();

  const panels = [
    {
      key: Panel.RESULT,
      name: 'Result',
      icon: <FontAwesomeIcon icon={faTable} style={{ color: '#96dd62' }} />,
      render: () =>
        loading ? (
          <QueryResultLoading />
        ) : (
          <QueryMultipleResultViewer key={queryKeyCounter} value={result} />
        ),
    },
    {
      key: Panel.ERROR,
      name: 'Error',
      icon: (
        <FontAwesomeIcon
          icon={faCircleExclamation}
          style={{ color: '#d3453a' }}
        />
      ),
      render: () => <ErrorPanel error={error} />,
    },
  ];
  const { schema, currentDatabase } = useSchema();
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
          setSelectedPanel(Panel.RESULT);
        })
        .catch((e) => {
          if (e.message) {
            setSelectedPanel(Panel.ERROR);
            setError(e.message);
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
        <div>
          <Stack spacing="none">
            <QueryWindowNameEditor tabKey={tabKey} />
            <Toolbar>
              <Toolbar.Item
                icon={<FontAwesomeIcon icon={faPlay} />}
                text="Run (F9)"
                onClick={() => onRun(getText())}
              />
              <Toolbar.Item
                icon={
                  <Stack spacing="none" center>
                    <FontAwesomeIcon
                      icon={faPlay}
                      style={{ paddingRight: 3 }}
                    />
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
      <div className={styles.bottomContainer}>
        <div className={styles.tabs}>
          <ul
            onWheel={(e) => {
              if (e.currentTarget) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {panels.map((tab) => {
              const isSelectedTab = tab.key === selectedPanel;

              return (
                <li
                  key={tab.key}
                  className={isSelectedTab ? styles.selected : ''}
                  onClick={() => {
                    setSelectedPanel(tab.key);
                  }}
                >
                  <span className={styles.icon}>
                    {tab.icon ? (
                      tab.icon
                    ) : (
                      <FontAwesomeIcon icon={faTableColumns} />
                    )}
                  </span>
                  <span>{tab.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.contentContainer}>
          {panels.map((tab) => {
            return (
              <div
                className={styles.content}
                key={tab.key}
                style={{
                  visibility: tab.key === selectedPanel ? 'visible' : 'hidden',
                }}
              >
                {tab.render()}
              </div>
            );
          })}
        </div>
      </div>
    </Splitter>
  );
}
