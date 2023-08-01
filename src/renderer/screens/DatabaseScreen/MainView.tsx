import Splitter from 'renderer/components/Splitter/Splitter';
import WindowTab, { WindowTabItem } from 'renderer/components/WindowTab';
import SqlDebugger from './SqlDebugger';
import { useCallback, useEffect } from 'react';
import { useAppFeature } from 'renderer/contexts/AppFeatureProvider';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from './QueryWindow';
import DatabaseTableList from 'renderer/components/DatabaseTable/DatabaseTableList';
import generateIncrementalName from 'renderer/utils/generateIncrementalName';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';

export default function MainView() {
  const { newWindow, tabs, setTabs, selectedTab, setSelectedTab } =
    useWindowTab();
  const { enableDebug } = useAppFeature();

  const onNewTabClick = useCallback(() => {
    const incrementalTabName = generateIncrementalName(
      tabs.map((tab) => tab.name),
      'Unnamed Query'
    );
    newWindow(incrementalTabName, (key, name) => (
      <QueryWindow tabKey={key} name={name} />
    ));
  }, [newWindow, tabs]);

  const handleTabDragged = (key: string, newIndex: number) => {
    const draggedTab = tabs.find((tab) => tab.key === key);
    if (!draggedTab) return;

    const updatedTabs = [...tabs];
    const currentIndex = updatedTabs.findIndex((tab) => tab.key === key);
    if (currentIndex !== -1) {
      updatedTabs.splice(currentIndex, 1);
      updatedTabs.splice(newIndex, 0, draggedTab);
      setTabs(updatedTabs);
    }
  };

  const { handleContextMenu } = useContextMenu(
    (additionalData?: WindowTabItem) => {
      console.log('additional data', additionalData);

      return [
        {
          text: 'Close',
          onClick: () => {
            if (additionalData) {
              onTabClosed(additionalData);
            }
          },
        },
        {
          text: 'Close Others',
          onClick: () => {
            if (additionalData) {
              setTabs(tabs.filter((tab) => tab.key === additionalData.key));
            }
          },
        },
        {
          text: 'Close to the Right',
          onClick: () => {
            if (additionalData) {
              console.log('Additional Data:', additionalData); // logging additional data
              console.log('Tabs:', tabs); // logging tabs array
              const index = tabs.findIndex(
                (tab) => tab.key === additionalData.key
              );
              console.log('Index:', index); // logging index
              // if tab is found
              if (index !== -1) {
                const newTabs = tabs.slice(0, index + 1);
                console.log('New tabs before setTabs:', newTabs); // logging newTabs before setting it
                setTabs(newTabs);
                console.log('New tabs after setTabs:', newTabs); // logging newTabs after setting it
              } else {
                console.log('Tab not found');
              }
            } else {
              console.log('Additional Data is null or undefined');
            }
          },
        },
      ];
    },
    [tabs]
  );

  useEffect(() => {
    console.log('Tabs array updated:', tabs); // logging updated tabs array
  }, [tabs]);

  const onTabClosed = useCallback(
    (closedTab: WindowTabItem) => {
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

      setTabs((prev) => prev.filter((tab) => tab.key !== closedTab.key));
    },
    [setSelectedTab, setTabs, selectedTab, tabs]
  );

  return (
    <Splitter primaryIndex={1} secondaryInitialSize={200}>
      <DatabaseTableList />
      <div>
        <Splitter vertical primaryIndex={0} secondaryInitialSize={100}>
          <WindowTab
            draggable
            selected={selectedTab}
            onTabContextMenu={handleContextMenu}
            onTabChanged={(item) => {
              setSelectedTab(item.key);
            }}
            onTabClosed={onTabClosed}
            onAddTab={onNewTabClick}
            tabs={tabs}
            onTabDragged={handleTabDragged}
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
