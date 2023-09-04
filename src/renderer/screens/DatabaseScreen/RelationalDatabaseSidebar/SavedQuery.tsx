import { useCallback, useEffect, useMemo, useState } from 'react';
import TreeView, { TreeViewItemData } from 'renderer/components/TreeView';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import TreeViewItemStorage from 'libs/TreeViewItemStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faFolder } from '@fortawesome/free-solid-svg-icons';
import { useSavedQueryPubSub } from '../SavedQueryProvider';

interface SavedQueryItem {
  sql?: string;
}

export default function SavedQuery() {
  const treeStorage = useMemo(
    () =>
      new TreeViewItemStorage<SavedQueryItem>({
        onIconMapper: (node) => {
          if (node.folder) {
            return <FontAwesomeIcon icon={faFolder} />;
          }

          return <FontAwesomeIcon icon={faCode} />;
        },
      }),
    []
  );
  const [tree, setTree] = useState<TreeViewItemData<SavedQueryItem>[]>([]);
  const [selectedKey, setSelectedKey] = useState<
    TreeViewItemData<SavedQueryItem> | undefined
  >();

  const { subscribe } = useSavedQueryPubSub();
  useEffect(() => {
    const subInstance = subscribe(({ id, name, sql }) => {
      console.log('subscribe receive', id, name, sql);
      treeStorage.renameNode(id, name);
      treeStorage.updateNode(id, name, { sql });
      setTree(treeStorage.toTreeViewArray());
    });
    return () => subInstance.destroy();
  }, [subscribe, treeStorage, setTree]);

  const newFolderCallback = useCallback(() => {
    treeStorage.insertNode({}, 'New Folder', true);
    setTree(treeStorage.toTreeViewArray());
  }, [treeStorage, setTree]);

  const newQueryCallback = useCallback(() => {
    treeStorage.insertNode({ sql: '' }, 'New Query', false);
    setTree(treeStorage.toTreeViewArray());
  }, [setTree, tree]);

  const { handleContextMenu } = useContextMenu(() => {
    return [
      {
        text: 'New Query',
        onClick: newQueryCallback,
      },
      {
        text: 'New Folder',
        separator: true,
        onClick: newFolderCallback,
      },
      {
        destructive: true,
        text: 'Remove',
      },
    ];
  }, [newFolderCallback, newQueryCallback]);

  return (
    <div style={{ height: '100%' }}>
      <TreeView
        items={tree}
        selected={selectedKey}
        onSelectChange={setSelectedKey}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
