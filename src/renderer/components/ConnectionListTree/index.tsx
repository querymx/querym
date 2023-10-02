import {
  ConnectionStoreItem,
  ConnectionStoreItemWithoutId,
} from 'drivers/base/SQLLikeConnection';
import {
  useState,
  useMemo,
  useEffect,
  createContext,
  useCallback,
  useContext,
} from 'react';
import ListViewEmptyState from 'renderer/components/ListView/ListViewEmptyState';
import TreeView, { TreeViewItemData } from 'renderer/components/TreeView';
import Layout from 'renderer/components/Layout';
import EditConnectionModal from './EditConnectionModal';
import NotImplementCallback from 'libs/NotImplementCallback';
import ConnectionToolbar from './ConnectionToolbar';
import useConnectionContextMenu from './useConnectionContextMenu';
import { useConnection } from 'renderer/App';
import ConnectionIcon from '../ConnectionIcon';
import IConnectionListStorage from 'libs/ConnectionListStorage/IConnectionListStorage';
import ConnectionListLocalStorage from 'libs/ConnectionListStorage/ConnectionListLocalStorage';

const ConnectionListContext = createContext<{
  storage: IConnectionListStorage;
  refresh: () => void;
  finishEditing: () => void;
  showEditConnection: (initialValue: ConnectionStoreItemWithoutId) => void;
  setSelectedItem: React.Dispatch<
    React.SetStateAction<TreeViewItemData<ConnectionStoreItem> | undefined>
  >;
}>({
  storage: new ConnectionListLocalStorage(),
  refresh: NotImplementCallback,
  finishEditing: NotImplementCallback,
  showEditConnection: NotImplementCallback,
  setSelectedItem: NotImplementCallback,
});

export function useConnectionList() {
  return useContext(ConnectionListContext);
}

function ConnectionListTreeBody({
  connectionList,
  selectedItem,
  setSelectedItem,
}: {
  connectionList: ConnectionStoreItem[];
  selectedItem: TreeViewItemData<ConnectionStoreItem> | undefined;
  setSelectedItem: React.Dispatch<
    React.SetStateAction<TreeViewItemData<ConnectionStoreItem> | undefined>
  >;
}) {
  const [collapsed, setCollapsed] = useState<string[] | undefined>(['recent']);
  const { connect } = useConnection();
  const { storage, refresh } = useConnectionList();

  const connectWithRecordUpdate = useCallback(
    (config: ConnectionStoreItem) => {
      connect(config);
      storage.updateLastUsed(config.id);
      refresh();
    },
    [storage, refresh, connect],
  );

  const treeItemList: TreeViewItemData<ConnectionStoreItem>[] = useMemo(() => {
    const tmp = [...connectionList];
    tmp.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    const recentConnections = tmp.slice(0, 5);
    const recentIds = recentConnections.map((r) => r.id);

    const other = connectionList.filter((c) => !recentIds.includes(c.id));

    return [
      {
        id: 'recent',
        text: 'Recent',
        children: recentConnections.map(
          (connection): TreeViewItemData<ConnectionStoreItem> => {
            return {
              id: connection.id,
              data: connection,
              icon: <ConnectionIcon dialect={connection.type} />,
              text: connection.name,
            };
          },
        ),
      },
      {
        id: 'other',
        text: 'Other',
        children: other.map(
          (connection): TreeViewItemData<ConnectionStoreItem> => {
            return {
              id: connection.id,
              data: connection,
              icon: <ConnectionIcon dialect={connection.type} />,
              text: connection.name,
            };
          },
        ),
      },
    ].filter((r) => r.children.length > 0);
  }, [connectionList]);

  const { handleContextMenu } = useConnectionContextMenu({
    selectedItem: selectedItem?.data,
    connectWithRecordUpdate,
  });

  return (
    <TreeView
      items={treeItemList}
      selected={selectedItem}
      onContextMenu={handleContextMenu}
      onSelectChange={setSelectedItem}
      collapsedKeys={collapsed}
      onCollapsedChange={setCollapsed}
      onDoubleClick={(e) => {
        if (e.data) {
          connectWithRecordUpdate(e.data);
        }
      }}
      emptyState={
        <ListViewEmptyState text="There is no database setting. Right click to create new setting." />
      }
    />
  );
}

export default function ConnectionListTree({
  storage,
}: {
  storage: IConnectionListStorage;
}) {
  const [selectedItem, setSelectedItem] =
    useState<TreeViewItemData<ConnectionStoreItem>>();
  const [editingItem, setEditingItem] =
    useState<ConnectionStoreItemWithoutId>();
  const [connectionList, setConnectionList] = useState<ConnectionStoreItem[]>(
    [],
  );

  const onRefresh = useCallback(() => {
    storage.loadAll().then(() => setConnectionList(storage.getAll()));
  }, [storage, setConnectionList]);

  const onFinishEditing = useCallback(
    () => setEditingItem(undefined),
    [setEditingItem],
  );

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <ConnectionListContext.Provider
      value={{
        storage,
        refresh: onRefresh,
        finishEditing: onFinishEditing,
        showEditConnection: setEditingItem,
        setSelectedItem: setSelectedItem,
      }}
    >
      <Layout>
        <Layout.Fixed>
          <ConnectionToolbar />
        </Layout.Fixed>
        <ConnectionListTreeBody
          connectionList={connectionList}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
      </Layout>

      {editingItem && <EditConnectionModal initialValue={editingItem} />}
    </ConnectionListContext.Provider>
  );
}
