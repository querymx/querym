import {
  ConnectionStoreItem,
  ConnectionStoreItemWithoutId,
} from 'drivers/base/SQLLikeConnection';
import ConnectionListStorage from 'libs/ConnectionListStorage';
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

const ConnectionListContext = createContext<{
  storage: ConnectionListStorage;
  refresh: () => void;
  finishEditing: () => void;
  showEditConnection: (initialValue: ConnectionStoreItemWithoutId) => void;
}>({
  storage: new ConnectionListStorage(),
  refresh: NotImplementCallback,
  finishEditing: NotImplementCallback,
  showEditConnection: NotImplementCallback,
});

export function useConnectionList() {
  return useContext(ConnectionListContext);
}

function ConnectionListTreeBody({
  connectionList,
}: {
  connectionList: ConnectionStoreItem[];
}) {
  const { connect } = useConnection();
  const [selectedItem, setSelectedItem] =
    useState<TreeViewItemData<ConnectionStoreItem>>();

  const treeItemList: TreeViewItemData<ConnectionStoreItem>[] = useMemo(() => {
    return connectionList.map(
      (connection): TreeViewItemData<ConnectionStoreItem> => {
        return {
          id: connection.id,
          data: connection,
          icon: <ConnectionIcon dialect={connection.type} />,
          text: connection.name,
        };
      },
    );
  }, [connectionList]);

  useEffect(() => {
    if (selectedItem && treeItemList) {
      if (!treeItemList.map((t) => t.id).includes(selectedItem.id)) {
        setSelectedItem(undefined);
      }
    }
  }, [treeItemList, selectedItem, setSelectedItem]);

  const { handleContextMenu } = useConnectionContextMenu({
    selectedItem: selectedItem?.data,
  });

  return (
    <TreeView
      items={treeItemList}
      selected={selectedItem}
      onContextMenu={handleContextMenu}
      onSelectChange={setSelectedItem}
      onDoubleClick={(e) => {
        if (e.data) {
          connect(e.data);
        }
      }}
      emptyState={
        <ListViewEmptyState text="There is no database setting. Right click to create new setting." />
      }
    />
  );
}

export default function ConnectionListTree() {
  const storage = useMemo(() => new ConnectionListStorage(), []);
  const [editingItem, setEditingItem] = useState<
    ConnectionStoreItemWithoutId | undefined
  >();
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
      }}
    >
      <Layout>
        <Layout.Fixed>
          <ConnectionToolbar />
        </Layout.Fixed>
        <ConnectionListTreeBody connectionList={connectionList} />
      </Layout>

      {editingItem && <EditConnectionModal initialValue={editingItem} />}
    </ConnectionListContext.Provider>
  );
}
