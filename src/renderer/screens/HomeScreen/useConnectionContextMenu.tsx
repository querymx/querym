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
  connections,
  setConnections,
  setSelectedItem,
}: {
  connections: ConnectionConfigTree[] | undefined;
  setConnections: (v: ConnectionConfigTree[]) => void;
  setSelectedItem: (
    v: TreeViewItemData<ConnectionConfigTree> | undefined
  ) => void;
}) {
  // // ----------------------------------------------
  // // Handle new connection
  // // ----------------------------------------------
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
        text: 'New Folder',
        onClick: newFolderClicked,
      },
      {
        text: 'New MySQL Database',
        icon: <Icon.MySql />,
        onClick: newMySQLDatabaseSetting,
      },
      // {
      //   text: 'Duplicate',
      //   onClick: onDuplicateClick,
      //   disabled: !selectedItem,
      // },
      // {
      //   text: 'Remove',
      //   onClick: onRemoveClick,
      //   disabled: !selectedItem,
      //   destructive: true,
      // },
    ];
  }, [newMySQLDatabaseSetting, newFolderClicked]);

  return { handleContextMenu };
}
