import styles from './DatabaseTable.module.scss';
import TreeView, { TreeViewItemData } from '../TreeView';
import { useState, useMemo } from 'react';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from 'renderer/screens/DatabaseScreen/QueryWindow';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import { QueryBuilder } from 'libs/QueryBuilder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTableList } from '@fortawesome/free-solid-svg-icons';

export default function DatabaseTableList() {
  const { schema, currentDatabase } = useSchmea();
  const [selected, setSelected] =
    useState<TreeViewItemData<{ name: string }>>();
  const { newWindow } = useWindowTab();
  const [collapsed, setCollapsed] = useState<string[] | undefined>(
    currentDatabase ? [`database/${currentDatabase}`] : []
  );

  const schemaListItem = useMemo(() => {
    if (!schema) return [];

    return Object.values(schema).map((database) => ({
      id: `database/${database.name}`,
      text: database.name,
      children: Object.values(database.tables)
        .map((table) => ({
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
          },
        }))
        .sort((item1, item2) => {
          return item1.text.localeCompare(item2.text);
        }),
    }));
  }, [schema]);

  if (!schema) return <div />;

  return (
    <div className={styles.tables}>
      <TreeView
        selected={selected}
        onSelectChange={setSelected}
        collapsedKeys={collapsed}
        onCollapsedChange={setCollapsed}
        onDoubleClick={(item) => {
          const tableName = item.data?.name;
          if (tableName) {
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
