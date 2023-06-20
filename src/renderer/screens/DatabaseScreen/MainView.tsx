import Splitter from 'renderer/components/Splitter/Splitter';
import WindowTab from 'renderer/components/WindowTab';
import DatabaseTableList from 'renderer/components/WindowTab/DatabaseTableList';
import SqlDebugger from './SqlDebugger';
import { useCallback } from 'react';
import { useAppFeature } from 'renderer/contexts/AppFeatureProvider';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from './QueryWindow';

export default function MainView() {
  const { newWindow, tabs, setTabs, selectedTab, setSelectedTab } =
    useWindowTab();
  const { enableDebug } = useAppFeature();

  const onNewTabClick = useCallback(() => {
    newWindow('Unnamed Query', (key, name) => (
      <QueryWindow tabKey={key} name={name} />
    ));
  }, [newWindow]);

  console.log(tabs);

  return (
    <Splitter primaryIndex={1} secondaryInitialSize={200}>
      <DatabaseTableList />
      <div>
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
          {enableDebug && (
            <div>
              <SqlDebugger />
            </div>
          )}
        </Splitter>
      </div>
    </Splitter>
  );
}
