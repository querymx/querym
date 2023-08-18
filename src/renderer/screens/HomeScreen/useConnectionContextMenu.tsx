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

export default function useConnectionContextMenu({
  treeDict,
  connections,
  selectedItem,
  setConnections,
  setSelectedItem,
  setRenameSelectedItem,
}: {
  treeDict: Record<string, ConnectionConfigTree>;
  connections: ConnectionConfigTree[] | undefined;
  selectedItem?: TreeViewItemData<ConnectionConfigTree>;
  setConnections: (v: ConnectionConfigTree[]) => void;
  setSelectedItem: (
    v: TreeViewItemData<ConnectionConfigTree> | undefined
  ) => void;
  setRenameSelectedItem: (v: boolean) => void;
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
        if (parent && parent.children) {
          parent.children = parent.children.filter(
            (node) => node.id === selectedItem.id
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
        (connections || []).map((c) => c.name),
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

    setConnections([...(connections || []), newTreeNode]);
  }, [setConnections, setSelectedItem, connections]);

  const newFolderClicked = useCallback(() => {
    const newFolderId = uuidv1();
    const newFolderName = generateIncrementalName(
      (connections || []).map((c) => c.name),
      'Unnamed Folders'
    );

    const newTreeNode: ConnectionConfigTree = {
      id: newFolderId,
      name: newFolderName,
      nodeType: 'folder',
      children: [],
    };

    setConnections([...(connections || []), newTreeNode]);
  }, [setConnections, connections]);

  const { handleContextMenu } = useContextMenu(() => {
    return [
      {
        text: 'Rename',
        disabled: !selectedItem,
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
        disabled: !selectedItem,
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
