import styles from './DatabaseTable.module.scss';
import TreeView, { TreeViewItemData } from '../TreeView';
import { useState, useMemo } from 'react';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from 'renderer/screens/DatabaseScreen/QueryWindow';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import { QueryBuilder } from 'libs/QueryBuilder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faEye,
  faGear,
  faTableList,
} from '@fortawesome/free-solid-svg-icons';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import SqlTableSchemaTab from 'renderer/screens/DatabaseScreen/SqlTableSchemaTab';

export default function DatabaseTableList() {
  const { schema, currentDatabase } = useSchmea();
  const [selected, setSelected] = useState<
    TreeViewItemData<{
      database: string;
      name: string;
      type: string;
    }>
  >();
  const { newWindow } = useWindowTab();
  const [collapsed, setCollapsed] = useState<string[] | undefined>(
    currentDatabase ? [`database/${currentDatabase}`] : []
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
        { text: 'Select 200 Rows' },
        {
          text: 'Open Structure',
          onClick: () => {
            newWindow(tableName, (key, name) => {
              return (
                <SqlTableSchemaTab
                  tabKey={key}
                  name={name}
                  database={databaseName}
                  table={tableName}
                />
              );
            });
          },
        },
      ];
    }

    return [];
  }, [selected, newWindow]);

  const schemaListItem = useMemo(() => {
    if (!schema) return [];

    return Object.values(schema).map((database) => {
      let children = Object.values(database.tables).map((table) => ({
        id: `database/${database.name}/table/${table.name}`,
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
          database: database.name,
        },
      }));

      if (database.events.length > 0) {
        children = children.concat(
          database.events.map((event) => ({
            id: `database/${database.name}/event/${event}`,
            text: event,
            icon: <FontAwesomeIcon icon={faCalendar} color="#27ae60" />,
            data: {
              name: event,
              type: 'event',
              database: database.name,
            },
          }))
        );
      }

      if (database.triggers.length > 0) {
        children = children.concat(
          database.triggers.map((trigger) => ({
            id: `database/${database.name}/trigger/${trigger}`,
            text: trigger,
            icon: <FontAwesomeIcon icon={faGear} color="#bdc3c7" />,
            data: {
              name: trigger,
              database: database.name,
              type: 'trigger',
            },
          }))
        );
      }

      children.sort((item1, item2) => {
        return item1.text.localeCompare(item2.text);
      });

      return {
        id: `database/${database.name}`,
        text: database.name,
        children,
      };
    });
  }, [schema]);

  if (!schema) return <div />;

  return (
    <div className={styles.tables}>
      <TreeView
        selected={selected}
        onSelectChange={setSelected}
        collapsedKeys={collapsed}
        onCollapsedChange={setCollapsed}
        onContextMenu={handleContextMenu}
        onDoubleClick={(item) => {
          const tableName = item.data?.name;
          const type = item.data?.type;
          if ((type === 'table' || type === 'view') && tableName) {
            newWindow(`SELECT ${tableName}`, (key, name) => (
              <QueryWindow
                initialSql={new QueryBuilder('mysql')
                  .table(tableName)
                  .limit(200)
                  .toRawSQL()}
                initialRun
                tabKey={key}
                name={name}
              />
            ));
          }
        }}
        items={schemaListItem}
      />
    </div>
  );
}
