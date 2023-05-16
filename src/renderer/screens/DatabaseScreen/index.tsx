import {
  ConnectionStoreItem,
  DatabaseSchemas,
} from 'drivers/SQLLikeConnection';
import { useState, useEffect, useCallback } from 'react';
import WindowTab from 'renderer/components/WindowTab';
import DatabaseTableList from 'renderer/components/WindowTab/DatabaseTableList';
import { SchemaProvider } from 'renderer/contexts/SchemaProvider';
import QueryWindow from './QueryWindow';
import { v1 as uuidv1 } from 'uuid';
import SqlDebugger from './SqlDebugger';
import { DatabaseSettingProvider } from 'renderer/contexts/DatabaseSettingProvider';
import {
  SqlExecuteProvider,
  useSqlExecute,
} from 'renderer/contexts/SqlExecuteProvider';
import {
  WindowTabProvider,
  useWindowTab,
} from 'renderer/contexts/WindowTabProvider';
import Splitter from 'renderer/components/Splitter/Splitter';
import SqlProtectionProvider from 'renderer/contexts/SqlProtectionProvider';

function DatabaseScreenBody() {
  const { common } = useSqlExecute();
  const { tabs, setTabs, selectedTab, setSelectedTab, newWindow } =
    useWindowTab();
  const [schema, setSchema] = useState<DatabaseSchemas | undefined>();

  useEffect(() => {
    newWindow('Unnamed Query', <QueryWindow />);
  }, [newWindow]);

  useEffect(() => {
    common.getSchema().then((data) => {
      setSchema(data);
    });
  }, [setSchema, common]);

  const onNewTabClick = useCallback(() => {
    const id = uuidv1();
    setTabs((prev) => [
      {
        name: 'Unnamed Query',
        key: id,
        component: <QueryWindow />,
      },
      ...prev,
    ]);
    setSelectedTab(id);
  }, [setTabs, selectedTab]);

  return (
    <SchemaProvider schema={schema}>
      <Splitter primaryIndex={1} secondaryInitialSize={200}>
        <DatabaseTableList />
        <div style={{ width: '100%', height: '100%' }}>
          <Splitter vertical primaryIndex={0} secondaryInitialSize={100}>
            <WindowTab
              selected={selectedTab}
              onTabChanged={(item) => {
                setSelectedTab(item.key);
              }}
              onTabClosed={(closedTab) => {
                // Close current tab will select other available tab
                if (closedTab.key === selectedTab) {
                  const closedTabIndex = tabs.findIndex(
                    (tab) => closedTab.key === tab.key
                  );

                  const nextTabKey =
                    closedTabIndex + 1 >= tabs.length
                      ? tabs[closedTabIndex - 1].key
                      : tabs[closedTabIndex + 1].key;

                  setSelectedTab(nextTabKey);
                }

                setTabs((prev) =>
                  prev.filter((tab) => tab.key !== closedTab.key)
                );
              }}
              onAddTab={onNewTabClick}
              tabs={tabs}
            />
            <div>
              <SqlDebugger />
            </div>
          </Splitter>
        </div>
      </Splitter>
    </SchemaProvider>
  );
}

export default function DatabaseScreen({
  config,
}: {
  config: ConnectionStoreItem;
}) {
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    window.electron.connect(config).then(() => setConnected(true));
  }, []);

  if (!isConnected) {
    return <div />;
  }

  return (
    <DatabaseSettingProvider setting={config}>
      <SqlExecuteProvider>
        <SqlProtectionProvider>
          <WindowTabProvider>
            <DatabaseScreenBody />
          </WindowTabProvider>
        </SqlProtectionProvider>
      </SqlExecuteProvider>
    </DatabaseSettingProvider>
  );
}
