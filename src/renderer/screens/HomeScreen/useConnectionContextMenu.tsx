import { v1 as uuidv1 } from 'uuid';
import { useCallback } from 'react';
import Icon from 'renderer/components/Icon';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import generateIncrementalName from 'renderer/utils/generateIncrementalName';
import {
  ConnectionConfigTree,
  ConnectionStoreConfig,
} from 'drivers/base/SQLLikeConnection';
import { TreeViewItemData } from 'renderer/components/TreeView';
import ConnectionSettingTree from 'libs/ConnectionSettingTree';

export default function useConnectionContextMenu({
  connectionTree,
  connections,
  selectedItem,
  setConnections,
  setSelectedItem,
  setRenameSelectedItem,
  setSaveCollapsedKeys,
  collapsedKeys,
}: {
  connectionTree: ConnectionSettingTree;
  connections: ConnectionConfigTree[] | undefined;
  selectedItem?: TreeViewItemData<ConnectionConfigTree>;
  setConnections: (v: ConnectionConfigTree[]) => void;
  setSelectedItem: (
    v: TreeViewItemData<ConnectionConfigTree> | undefined
  ) => void;
  setRenameSelectedItem: (v: boolean) => void;
  collapsedKeys: string[] | undefined;
  setSaveCollapsedKeys: (v: string[] | undefined) => void;
}) {
  // ----------------------------------------------
  // Handle remove database
  // ----------------------------------------------
  const onRemoveClick = useCallback(async () => {
    if (selectedItem && connections) {
      const buttonIndex = await window.electron.showMessageBox({
        title: 'Do you want to remove?',
        message: `Do you want to remove ${selectedItem.text}?`,
        buttons: ['Yes', 'No'],
      });

      if (buttonIndex !== 0) return;

      if (selectedItem.data?.parentId) {
        const parent = connectionTree.getById(selectedItem.data.parentId);
        if (parent?.children) {
          parent.children = parent.children.filter(
            (node) => node.id !== selectedItem.id
          );
        }
      }

      setConnections(connections.filter((db) => db.id !== selectedItem.id));
      setSelectedItem(undefined);
    }
  }, [
    selectedItem,
    setSelectedItem,
    connections,
    setConnections,
    connectionTree,
  ]);

  // ----------------------------------------------
  // Handle new connection
  // ----------------------------------------------
  const newConnection = useCallback(
    (type: string, config: ConnectionStoreConfig) => {
      const newConnectionId = uuidv1();
      const newConfig = {
        id: newConnectionId,
        name: generateIncrementalName(
          connectionTree.getAllNodes().map((node) => node.name),
          'Unnamed'
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
    ]
  );

  const newFolderClicked = useCallback(() => {
    const newFolderId = uuidv1();
    const newFolderName = generateIncrementalName(
      connectionTree.getAllNodes().map((node) => node.name),
      'Unnamed Folders'
    );

    const newTreeNode: ConnectionConfigTree = {
      id: newFolderId,
      name: newFolderName,
      nodeType: 'folder',
      children: [],
    };

    setSelectedItem({
      id: newTreeNode.id,
      text: newTreeNode.name,
      data: newTreeNode,
    });

    connectionTree.insertNode(newTreeNode, selectedItem?.id);
    setConnections(connectionTree.getNewTree());

    if (selectedItem) {
      setSaveCollapsedKeys([...(collapsedKeys ?? []), selectedItem.id]);
    }
  }, [
    setConnections,
    setSelectedItem,
    connections,
    selectedItem,
    connectionTree,
    collapsedKeys,
    setSaveCollapsedKeys,
  ]);

  const { handleContextMenu } = useContextMenu(() => {
    return [
      {
        text: 'New MySQL Connection',
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
        text: 'New PostgreSQL Connection (Beta)',
        icon: <Icon.PostgreSQL />,
        onClick: () =>
          newConnection('postgre', {
            database: '',
            host: '',
            password: '',
            port: '3306',
            user: '',
          }),
        separator: true,
      },
      {
        text: 'New Folder',
        onClick: newFolderClicked,
      },
      {
        text: 'Rename',
        disabled: !selectedItem?.data,
        onClick: () => setRenameSelectedItem(true),
        separator: true,
      },
      {
        text: 'Remove',
        onClick: onRemoveClick,
        disabled: !selectedItem?.data,
        destructive: true,
      },
    ];
  }, [selectedItem, newConnection, newFolderClicked, setRenameSelectedItem]);

  return { handleContextMenu };
}
