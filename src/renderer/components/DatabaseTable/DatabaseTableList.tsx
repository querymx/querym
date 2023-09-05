import styles from './styles.module.scss';
import TreeView, { TreeViewItemData } from '../TreeView';
import { useState, useMemo, useCallback } from 'react';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from 'renderer/screens/DatabaseScreen/QueryWindow';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import { QueryBuilder } from 'libs/QueryBuilder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faCode,
  faEye,
  faGear,
  faTableList,
} from '@fortawesome/free-solid-svg-icons';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import SqlTableSchemaTab from 'renderer/screens/DatabaseScreen/SqlTableSchemaTab';
import Layout from '../Layout';
import DatabaseSelection from './DatabaseSelection';
import ListViewEmptyState from '../ListView/ListViewEmptyState';
import TextField from '../TextField';
import { useDebounce } from 'hooks/useDebounce';

type SelectedTreeViewItem = TreeViewItemData<{
  database: string;
  name: string;
  type: string;
}>;

export default function DatabaseTableList() {
  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 500);
  const { schema, currentDatabase } = useSchema();
  const [selected, setSelected] = useState<SelectedTreeViewItem>();
  const { newWindow } = useWindowTab();
  const [collapsed, setCollapsed] = useState<string[] | undefined>([
    'tables',
    'events',
    'triggers',
  ]);

  const select200RowCallback = useCallback((item: SelectedTreeViewItem) => {
    const tableName = item.data?.name;
    const type = item.data?.type;
    if ((type === 'table' || type === 'view') && tableName) {
      newWindow(
        `SELECT ${tableName}`,
        (key, name) => (
          <QueryWindow
            initialSql={new QueryBuilder('mysql')
              .table(tableName)
              .limit(200)
              .toRawSQL()}
            initialRun
            tabKey={key}
            name={name}
          />
        ),
        { icon: <FontAwesomeIcon icon={faCode} /> }
      );
    }
  }, []);

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
          text: 'Select 200 Rows',
          onClick: () => select200RowCallback(selected),
        },
        {
          text: 'Open Structure',
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
              { icon: <FontAwesomeIcon icon={faTableList} color="#3498db" /> }
            );
          },
        },
      ];
    }

    return [];
  }, [selected, newWindow]);

  const schemaListItem = useMemo(() => {
    if (!schema) return [];
    if (!currentDatabase) return [];

    const currentDatabaseSchema = schema[currentDatabase];
    if (!currentDatabaseSchema) return [];

    const tables = Object.values(currentDatabaseSchema.tables)
      .map((table) => ({
        id: `table/${table.name}`,
        text: table.name,
        icon:
          table.type === 'TABLE' ? (
            <FontAwesomeIcon icon={faTableList} color="#3498db" />
          ) : (
            <FontAwesomeIcon icon={faEye} color="#e67e22" />
          ),
        data: {
          name: table.name,
          type: table.type === 'TABLE' ? 'table' : 'view',
          database: currentDatabase,
        },
      }))
      .filter((table) => {
        if (searchDebounce) {
          return table.text.indexOf(searchDebounce) >= 0;
        }

        return true;
      });

    const triggers = currentDatabaseSchema.triggers
      .map((trigger) => ({
        id: `trigger/${trigger}`,
        text: trigger,
        icon: <FontAwesomeIcon icon={faGear} color="#bdc3c7" />,
        data: {
          name: trigger,
          database: currentDatabase,
          type: 'trigger',
        },
      }))
      .filter((table) => {
        if (searchDebounce) {
          return table.text.indexOf(searchDebounce) >= 0;
        }

        return true;
      });

    const events = currentDatabaseSchema.events
      .map((event) => ({
        id: `event/${event}`,
        text: event,
        icon: <FontAwesomeIcon icon={faCalendar} color="#27ae60" />,
        data: {
          name: event,
          type: 'event',
          database: currentDatabase,
        },
      }))
      .filter((table) => {
        if (searchDebounce) {
          return table.text.indexOf(searchDebounce) >= 0;
        }

        return true;
      });

    tables.sort((a, b) => a.text.localeCompare(b.text));
    triggers.sort((a, b) => a.text.localeCompare(b.text));
    events.sort((a, b) => a.text.localeCompare(b.text));

    return [
      {
        id: 'tables',
        text: `Tables (${Object.values(currentDatabaseSchema.tables).length})`,
        children: tables,
      },
      {
        id: 'events',
        text: `Events (${currentDatabaseSchema.events.length})`,
        children: events,
      },
      {
        id: 'triggers',
        text: `Triggers (${currentDatabaseSchema.triggers.length})`,
        children: triggers,
      },
    ];
  }, [schema, currentDatabase, searchDebounce]);

  if (!schema) return <div />;

  return (
    <div className={styles.tables}>
      <Layout>
        <Layout.Fixed>
          <DatabaseSelection />
        </Layout.Fixed>
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
              onDoubleClick={select200RowCallback}
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
