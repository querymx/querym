import Splitter from 'renderer/components/Splitter/Splitter';
import WindowTab, { WindowTabItem } from 'renderer/components/WindowTab';
import { useCallback, useState } from 'react';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from './QueryWindow';
import generateIncrementalName from 'renderer/utils/generateIncrementalName';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import Layout from 'renderer/components/Layout';
import MainToolbar from './MainToolbar';
import RelationalDatabaseSidebar from './RelationalDatabaseSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import WindowTabRenameModal from './WindowTabRenameModal';

export default function MainView() {
  const { newWindow, tabs, setTabs, selectedTab, setSelectedTab } =
    useWindowTab();

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTabId, setRenameTabId] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const onNewTabClick = useCallback(() => {
    const incrementalTabName = generateIncrementalName(
      tabs.map((tab) => tab.name),
      'Unnamed Query'
    );
    newWindow(incrementalTabName, () => <QueryWindow />, {
      icon: <FontAwesomeIcon icon={faCode} />,
    });
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

  const { handleContextMenu } = useContextMenu(
    (additionalData?: WindowTabItem) => {
      return [
        {
          text: 'Rename',
          separator: true,
          onClick: () => {
            setShowRenameModal(true);
            setRenameValue(additionalData?.name ?? '');
            setRenameTabId(additionalData?.key ?? '');
          },
        },
        {
          text: 'Close',
          disabled: tabs.length === 1,
          onClick: () => {
            if (additionalData) {
              onTabClosed(additionalData);
            }
          },
        },
        {
          text: 'Close Others',
          disabled: tabs.length === 1,
          onClick: () => {
            if (additionalData) {
              setTabs(tabs.filter((tab) => tab.key === additionalData.key));
              setSelectedTab(additionalData.key);
            }
          },
        },
        {
          text: 'Close to the Right',
          disabled:
            tabs.findIndex((tab) => tab.key === additionalData?.key) >=
            tabs.length - 1,
          onClick: () => {
            if (additionalData) {
              const index = tabs.findIndex(
                (tab) => tab.key === additionalData.key
              );

              const selectedIndex = tabs.findIndex(
                (tab) => tab.key === selectedTab
              );

              if (selectedIndex > index) {
                setSelectedTab(additionalData.key);
              }

              // if tab is found
              if (index !== -1) {
                const newTabs = tabs.slice(0, index + 1);
                setTabs(newTabs);
              }
            }
          },
        },
      ];
    },
    [
      tabs,
      onTabClosed,
      setTabs,
      setSelectedTab,
      selectedTab,
      setShowRenameModal,
      setRenameValue,
      setRenameTabId,
    ]
  );

  return (
    <Splitter primaryIndex={1} secondaryInitialSize={200}>
      <RelationalDatabaseSidebar />

      <Layout>
        <Layout.Fixed>
          <MainToolbar />
        </Layout.Fixed>
        <Layout.Grow>
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
        </Layout.Grow>

        {showRenameModal && (
          <WindowTabRenameModal
            initialValue={renameValue}
            onClose={() => setShowRenameModal(false)}
            setTabs={setTabs}
            tabKey={renameTabId}
          />
        )}
      </Layout>
    </Splitter>
  );
}
