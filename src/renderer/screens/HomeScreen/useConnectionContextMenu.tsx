import { v1 as uuidv1 } from 'uuid';
import { useCallback } from 'react';
import Icon from 'renderer/components/Icon';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import generateIncrementalName from 'renderer/utils/generateIncrementalName';
import {
  ConnectionConfigTree,
  ConnectionStoreConfig,
} from 'drivers/SQLLikeConnection';
import { TreeViewItemData } from 'renderer/components/TreeView';
import { sortConnection } from '.';

function insertNodeToConnection(
  connections: ConnectionConfigTree[] | undefined,
  selectedItem: TreeViewItemData<ConnectionConfigTree> | undefined,
  treeDict: Record<string, ConnectionConfigTree>,
  newNode: ConnectionConfigTree
) {
  if (connections) {
    let insideFolder: ConnectionConfigTree | undefined;
    if (selectedItem?.data) {
      if (selectedItem.data.nodeType === 'folder') {
        insideFolder = selectedItem.data;
      } else if (selectedItem.data?.parentId) {
        insideFolder = treeDict[selectedItem.data.parentId];
      }
    }

    if (insideFolder?.children) {
      newNode.parentId = insideFolder.id;
      insideFolder.children = sortConnection([
        ...insideFolder.children,
        newNode,
      ]);
      return [...connections];
    } else {
      return sortConnection([...connections, newNode]);
    }
  }
  return [];
}

export default function useConnectionContextMenu({
  treeDict,
  connections,
  selectedItem,
  setConnections,
  setSelectedItem,
  setRenameSelectedItem,
  setSaveCollapsedKeys,
  collapsedKeys,
}: {
  treeDict: Record<string, ConnectionConfigTree>;
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
        const parent = treeDict[selectedItem.data.parentId];
        if (parent?.children) {
          parent.children = parent.children.filter(
            (node) => node.id !== selectedItem.id
          );
        }
      }

      setConnections(connections.filter((db) => db.id !== selectedItem.id));
      setSelectedItem(undefined);
    }
  }, [selectedItem, setSelectedItem, connections, setConnections, treeDict]);

  // ----------------------------------------------
  // Handle new connection
  // ----------------------------------------------
  const newMySQLDatabaseSetting = useCallback(() => {
    const newConnectionId = uuidv1();
    const newConfig = {
      id: newConnectionId,
      name: generateIncrementalName(
        Object.values(treeDict).map((node) => node.name),
        'Unnamed'
      ),
      type: 'mysql',
      config: {
        database: '',
        host: '',
        password: '',
        port: '3306',
        user: '',
      } as ConnectionStoreConfig,
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

    setConnections(
      insertNodeToConnection(connections, selectedItem, treeDict, newTreeNode)
    );

    if (selectedItem) {
      setSaveCollapsedKeys([...(collapsedKeys ?? []), selectedItem.id]);
    }
  }, [
    setConnections,
    setSelectedItem,
    selectedItem,
    connections,
    treeDict,
    collapsedKeys,
    setSaveCollapsedKeys,
  ]);

  const newFolderClicked = useCallback(() => {
    const newFolderId = uuidv1();
    const newFolderName = generateIncrementalName(
      Object.values(treeDict).map((node) => node.name),
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

    setConnections(
      insertNodeToConnection(connections, selectedItem, treeDict, newTreeNode)
    );

    if (selectedItem) {
      setSaveCollapsedKeys([...(collapsedKeys ?? []), selectedItem.id]);
    }
  }, [
    setConnections,
    setSelectedItem,
    connections,
    selectedItem,
    treeDict,
    collapsedKeys,
    setSaveCollapsedKeys,
  ]);

  const { handleContextMenu } = useContextMenu(() => {
    return [
      {
        text: 'Rename',
        disabled: !selectedItem?.data,
        onClick: () => setRenameSelectedItem(true),
        separator: true,
      },
      {
        text: 'New Folder',
        onClick: newFolderClicked,
      },
      {
        text: 'New MySQL Database',
        icon: <Icon.MySql />,
        onClick: newMySQLDatabaseSetting,
        separator: true,
      },
      {
        text: 'Remove',
        onClick: onRemoveClick,
        disabled: !selectedItem?.data,
        destructive: true,
      },
    ];
  }, [
    selectedItem,
    newMySQLDatabaseSetting,
    newFolderClicked,
    setRenameSelectedItem,
  ]);

  return { handleContextMenu };
}
