import {
  ConnectionConfigTree,
  ConnectionStoreConfig,
} from 'drivers/base/SQLLikeConnection';
import ConnectionSettingTree from 'libs/ConnectionSettingTree';
import { useCallback, useMemo } from 'react';
import { ContextMenuItemProps } from 'renderer/components/ContextMenu';
import Icon from 'renderer/components/Icon';
import { TreeViewItemData } from 'renderer/components/TreeView';
import generateIncrementalName from 'renderer/utils/generateIncrementalName';
import { v1 as uuidv1 } from 'uuid';

export default function useNewConnectionMenu({
  connectionTree,
  connections,
  selectedItem,
  setConnections,
  setSelectedItem,
  setSaveCollapsedKeys,
  collapsedKeys,
}: {
  connectionTree: ConnectionSettingTree;
  connections: ConnectionConfigTree[] | undefined;
  selectedItem?: TreeViewItemData<ConnectionConfigTree>;
  setConnections: (v: ConnectionConfigTree[]) => void;
  setSelectedItem: (
    v: TreeViewItemData<ConnectionConfigTree> | undefined,
  ) => void;
  setRenameSelectedItem: (v: boolean) => void;
  collapsedKeys: string[] | undefined;
  setSaveCollapsedKeys: (v: string[] | undefined) => void;
}) {
  const newConnection = useCallback(
    (type: string, config: ConnectionStoreConfig) => {
      const newConnectionId = uuidv1();
      const newConfig = {
        id: newConnectionId,
        name: generateIncrementalName(
          connectionTree.getAllNodes().map((node) => node.name),
          'Unnamed',
        ),
        type,
        config,
      };

      const newTreeNode: ConnectionConfigTree = {
        id: newConfig.id,
        name: newConfig.name,
        nodeType: 'connection',
        config: newConfig,
      };

      setSelectedItem({
        id: newTreeNode.id,
        text: newTreeNode.name,
        data: newTreeNode,
        icon: <Icon.MySql />,
      });

      connectionTree.insertNode(newTreeNode, selectedItem?.id);
      setConnections(connectionTree.getNewTree());

      if (selectedItem) {
        setSaveCollapsedKeys([...(collapsedKeys ?? []), selectedItem.id]);
      }
    },
    [
      setConnections,
      setSelectedItem,
      selectedItem,
      connections,
      connectionTree,
      collapsedKeys,
      setSaveCollapsedKeys,
    ],
  );

  const menu: ContextMenuItemProps[] = useMemo(() => {
    return [
      {
        text: 'MySQL',
        icon: <Icon.MySql />,
        onClick: () =>
          newConnection('mysql', {
            database: '',
            host: '',
            password: '',
            port: '3306',
            user: '',
          }),
      },
      {
        text: 'PostgreSQL',
        icon: <Icon.PostgreSQL />,
        onClick: () =>
          newConnection('postgre', {
            database: '',
            host: '',
            password: '',
            port: '3306',
            user: '',
          }),
      },
      { text: 'SQLite (coming soon)', disabled: true },
    ];
  }, [newConnection]);

  return menu;
}
