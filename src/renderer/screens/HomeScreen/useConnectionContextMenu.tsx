import { v1 as uuidv1 } from 'uuid';
import { useCallback } from 'react';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import generateIncrementalName from 'renderer/utils/generateIncrementalName';
import { ConnectionConfigTree } from 'drivers/base/SQLLikeConnection';
import { TreeViewItemData } from 'renderer/components/TreeView';
import ConnectionSettingTree from 'libs/ConnectionSettingTree';
import { ContextMenuItemProps } from 'renderer/components/ContextMenu';

export default function useConnectionContextMenu({
  connectionTree,
  connections,
  selectedItem,
  setConnections,
  setSelectedItem,
  setRenameSelectedItem,
  setSaveCollapsedKeys,
  collapsedKeys,
  newConnectionMenu,
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
  newConnectionMenu: ContextMenuItemProps[];
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
            (node) => node.id !== selectedItem.id,
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

  const newFolderClicked = useCallback(() => {
    const newFolderId = uuidv1();
    const newFolderName = generateIncrementalName(
      connectionTree.getAllNodes().map((node) => node.name),
      'Unnamed Folders',
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
        text: 'New Connection',
        children: newConnectionMenu,
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
  }, [
    selectedItem,
    newFolderClicked,
    setRenameSelectedItem,
    newConnectionMenu,
  ]);

  return { handleContextMenu };
}
