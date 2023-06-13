import styles from './DatabaseTable.module.scss';
import TreeView, { TreeViewItemData } from '../TreeView';
import { useState } from 'react';
import Icon from '../Icon';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from 'renderer/screens/DatabaseScreen/QueryWindow';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import { QueryBuilder } from 'libs/QueryBuilder';

export default function DatabaseTableList() {
  const { schema, currentDatabase } = useSchmea();
  const [selected, setSelected] =
    useState<TreeViewItemData<{ name: string }>>();
  const { newWindow } = useWindowTab();
  const [collapsed, setCollapsed] = useState<string[] | undefined>(
    currentDatabase ? [`database/${currentDatabase}`] : []
  );

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
        items={Object.values(schema).map((database) => ({
          id: `database/${database.name}`,
          text: database.name,
          children: Object.values(database.tables).map((table) => ({
            id: `database/${database.name}/table/${table.name}`,
            text: table.name,
            icon: <Icon.Table />,
            data: {
              name: table.name,
            },
          })),
        }))}
      />
    </div>
  );
}
