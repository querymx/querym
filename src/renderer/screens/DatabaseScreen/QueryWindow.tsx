import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faICursor, faSave } from '@fortawesome/free-solid-svg-icons';
import { format } from 'sql-formatter';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { SqlStatementResult } from 'libs/SqlRunnerManager';
import { EditorState } from '@codemirror/state';
import { useSavedQueryPubSub } from './SavedQueryProvider';
import { useKeybinding } from 'renderer/contexts/KeyBindingProvider';
import { useCurrentTab } from 'renderer/components/WindowTab';
import { QueryTypedResult } from 'types/SqlResult';

export type EnumSchema = Array<{
  table: string;
  column: string;
  values: string[];
}>;

interface QueryWindowProps {
  initialSql?: string;
  initialRun?: boolean;
}

export default function QueryWindow({
  initialSql,
  initialRun,
}: QueryWindowProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const { binding } = useKeybinding();
  const keyRunQuery = binding['run-query'];
  const keyRunCurrentQuery = binding['run-current-query'];
  const keySaveQuery = binding['save-query'];

  const [loading, setLoading] = useState(false);
  const [queryKeyCounter, setQueryKeyCounter] = useState(0);
  const [result, setResult] = useState<SqlStatementResult<QueryTypedResult>[]>(
    [],
  );
  const { publish } = useSavedQueryPubSub();

  const { runner, common } = useSqlExecute();
  const { showErrorDialog } = useDialog();
  const { schema, currentDatabase, dialect } = useSchema();
  const { selectedTab, setTabData, saveWindowTabHistory } = useWindowTab();

  const { tabName, tabKey } = useCurrentTab();

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
          setCode(
            format(codeFromRef, {
              language: dialect === 'mysql' ? 'mysql' : 'postgresql',
            }),
          );
        },
        separator: true,
      },
      {
        text: 'Cut',
        hotkey: 'Ctrl + X',
        onClick: () => {
          if (viewState) {
            window.navigator.clipboard.writeText(
              viewState.sliceDoc(selectFrom, selectTo),
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
              viewState.sliceDoc(selectFrom, selectTo),
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
  }, [editorRef, setCode, dialect]);

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
    if (tabKey) {
      publish({ id: tabKey, name: tabName, sql: getText() });
    }
  }, [getText, tabName, tabKey]);

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
          },
        )
        .then((r) => {
          setResult(common.attachHeaders(r, schema));
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
    [runner, setResult, schema, setLoading, saveWindowTabHistory, common],
  );

  const onRun = useCallback(
    (sqlCode: string) => {
      if (!editorRef.current || sqlCode === '') return;
      executeSql(sqlCode);
    },
    [executeSql, editorRef],
  );

  useEffect(() => {
    if (selectedTab === tabKey) {
      const onKeyBinding = (e: KeyboardEvent) => {
        if (keyRunCurrentQuery.match(e)) {
          onRun(getSelection());
        } else if (keyRunQuery.match(e)) {
          onRun(getText());
        }
      };

      document.addEventListener('keydown', onKeyBinding);
      return () => document.removeEventListener('keydown', onKeyBinding);
    }
  }, [onRun, selectedTab, tabKey, keyRunCurrentQuery, keyRunQuery]);

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
    <Splitter vertical primaryIndex={1} secondaryInitialSize={300}>
      <div className={styles.queryContainer}>
        <div className={styles.queryEditor}>
          <SqlCodeEditor
            dialect={dialect}
            ref={editorRef}
            onContextMenu={handleContextMenu}
            style={{ fontSize: 20, height: '100%' }}
            value={code}
            onChange={(newCode) => {
              setCode(newCode);
              setTabData(tabKey, { sql: newCode, type: 'query' });
            }}
            onKeyDown={(e) => {
              if (keySaveQuery.match(e)) {
                savedQuery();
              }
            }}
            height="100%"
            schema={schema}
            currentDatabase={currentDatabase}
          />
        </div>

        <div>
          <Toolbar>
            <Toolbar.Item
              icon={<FontAwesomeIcon icon={faPlay} color="#27ae60" />}
              text="Run"
              keyboard={keyRunQuery.toString()}
              onClick={() => onRun(getText())}
            />
            <Toolbar.Item
              icon={
                <Stack spacing="none" center>
                  <FontAwesomeIcon
                    icon={faPlay}
                    style={{ paddingRight: 3 }}
                    color="#27ae60"
                  />
                  <FontAwesomeIcon icon={faICursor} style={{ height: 11 }} />
                </Stack>
              }
              text="Run Selection"
              keyboard={keyRunCurrentQuery.toString()}
              onClick={() => onRun(getSelection())}
            />
            <Toolbar.Separator />
            <Toolbar.Item
              text="Save"
              keyboard={keySaveQuery.toString()}
              onClick={savedQuery}
              primary
              icon={<FontAwesomeIcon icon={faSave} color={'inherit'} />}
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
