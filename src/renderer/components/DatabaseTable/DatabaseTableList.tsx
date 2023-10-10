import styles from './styles.module.scss';
import TreeView, { TreeViewItemData } from '../TreeView';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRefresh,
  faTableCells,
  faTableList,
} from '@fortawesome/free-solid-svg-icons';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import SqlTableSchemaTab from 'renderer/screens/DatabaseScreen/SqlTableSchemaTab';
import Layout from '../Layout';
import DatabaseSelection from './DatabaseSelection';
import ListViewEmptyState from '../ListView/ListViewEmptyState';
import TextField from '../TextField';
import { useDebounce } from 'renderer/hooks/useDebounce';
import TableDataViewer from 'renderer/screens/DatabaseScreen/TableDataViewer';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { buildSchemaTree } from './buildTableTree';

type SelectedTreeViewItem = TreeViewItemData<{
  database: string;
  name: string;
  type: string;
}>;

export default function DatabaseTableList() {
  const [search, setSearch] = useState('');
  const { reloadSchema } = useSchema();
  const { common } = useSqlExecute();
  const searchDebounce = useDebounce(search, 500);
  const { schema, currentDatabase } = useSchema();
  const [selected, setSelected] = useState<SelectedTreeViewItem>();
  const { newWindow } = useWindowTab();

  const [collapsed, setCollapsed] = useState<string[] | undefined>();

  useEffect(() => {
    setCollapsed([
      `${currentDatabase}/tables`,
      `${currentDatabase}/events`,
      `${currentDatabase}/triggers`,
    ]);
  }, [setCollapsed, currentDatabase]);

  const viewTableData = useCallback(
    (item: SelectedTreeViewItem) => {
      const tableName = item.data?.name;
      const databaseName = item.data?.database;
      const type = item.data?.type;
      if ((type === 'table' || type === 'view') && tableName && databaseName) {
        newWindow(
          tableName,
          (key, name) => (
            <TableDataViewer
              tableName={tableName}
              databaseName={databaseName}
              tabKey={key}
              name={name}
            />
          ),
          { icon: <FontAwesomeIcon icon={faTableCells} color="#9b59b6" /> },
        );
      }
    },
    [currentDatabase],
  );

  const { handleContextMenu } = useContextMenu(() => {
    const tableName = selected?.data?.name;
    const databaseName = selected?.data?.database;

    if (
      selected &&
      selected.data &&
      selected.data.type === 'table' &&
      tableName &&
      databaseName
    ) {
      return [
        {
          text: 'View Data',
          onClick: () => viewTableData(selected),
        },
        {
          text: 'Open Structure',
          separator: true,
          onClick: () => {
            newWindow(
              tableName,
              (key, name) => {
                return (
                  <SqlTableSchemaTab
                    tabKey={key}
                    name={name}
                    database={databaseName}
                    table={tableName}
                  />
                );
              },
              { icon: <FontAwesomeIcon icon={faTableList} color="#3498db" /> },
            );
          },
        },
        {
          text: 'Refresh',
          icon: <FontAwesomeIcon icon={faRefresh} />,
          onClick: () => reloadSchema(),
        },
      ];
    }

    return [];
  }, [selected, newWindow]);

  const schemaListItem = useMemo(() => {
    if (!schema) return [];

    if (common.FLAG_USE_STATEMENT) {
      if (!currentDatabase) return [];
      const currentDatabaseSchema = schema.getDatabase(currentDatabase);
      if (!currentDatabaseSchema) return [];
      return buildSchemaTree(currentDatabaseSchema, searchDebounce).children;
    } else {
      return Object.entries(schema.getSchema()).map((entry) => {
        return buildSchemaTree(entry[1], search);
      });
    }
  }, [schema, currentDatabase, searchDebounce]);

  if (!schema) return <div />;

  return (
    <div className={styles.tables}>
      <Layout>
        {common.FLAG_USE_STATEMENT && (
          <Layout.Fixed>
            <DatabaseSelection />
          </Layout.Fixed>
        )}
        <Layout.Grow>
          {currentDatabase ? (
            <TreeView
              highlight={search || undefined}
              highlightDepth={1}
              selected={selected}
              onSelectChange={setSelected}
              collapsedKeys={collapsed}
              onCollapsedChange={setCollapsed}
              onContextMenu={handleContextMenu}
              onDoubleClick={viewTableData}
              items={schemaListItem}
            />
          ) : (
            <ListViewEmptyState text="Please select database to see tables, events, triggers, etc..." />
          )}
        </Layout.Grow>
        <Layout.Fixed>
          <div style={{ padding: 5 }}>
            <TextField
              label=""
              placeholder="Search here"
              value={search}
              onChange={setSearch}
            />
          </div>
        </Layout.Fixed>
      </Layout>
    </div>
  );
}
