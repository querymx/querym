import { useMemo, useState } from 'react';
import DatabaseTableList from 'renderer/components/DatabaseTable/DatabaseTableList';
import WindowTab, { WindowTabItem } from 'renderer/components/WindowTab';
import SavedQuery from './SavedQuery';

export default function RelationalDatabaseSidebar() {
  const [selectedTabKey, setSelectedTabKey] = useState('schema');

  const tabItems = useMemo<WindowTabItem[]>(() => {
    return [
      {
        component: <DatabaseTableList />,
        key: 'schema',
        name: 'Schema',
      },
      {
        component: <SavedQuery />,
        key: 'saved-query',
        name: 'Saved Queries',
      },
    ];
  }, []);

  return (
    <div style={{ height: '100%', background: 'var(--color-list-surface)' }}>
      <WindowTab
        selected={selectedTabKey}
        onTabChanged={(tab) => {
          setSelectedTabKey(tab.key);
        }}
        tabs={tabItems}
      />
    </div>
  );
}
