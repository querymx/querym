import { useCallback, useEffect, useMemo, useState } from 'react';
import TreeView, { TreeViewItemData } from 'renderer/components/TreeView';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import TreeViewItemStorage from 'libs/TreeViewItemStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faFolder } from '@fortawesome/free-solid-svg-icons';
import { useSavedQueryPubSub } from '../SavedQueryProvider';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from '../QueryWindow';

interface SavedQueryItem {
  sql?: string;
}

export default function SavedQuery() {
  const treeStorage = useMemo(
    () =>
      new TreeViewItemStorage<SavedQueryItem>({
        onIconMapper: (node) => {
          if (node.folder) {
            return <FontAwesomeIcon icon={faFolder} color="#f39c12" />;
          }

          return <FontAwesomeIcon icon={faCode} color="#27ae60" />;
        },
      }),
    []
  );

  const [tree, setTree] = useState<TreeViewItemData<SavedQueryItem>[]>([]);
  const { newWindow, tabs, setSelectedTab } = useWindowTab();
  const [selectedKey, setSelectedKey] = useState<
    TreeViewItemData<SavedQueryItem> | undefined
  >();

  const { subscribe } = useSavedQueryPubSub();
  useEffect(() => {
    const subInstance = subscribe(({ id, name, sql }) => {
      console.log('subscribe receive 2', id, name, sql);
      treeStorage.updateNode(id, name, { sql });
      console.log(treeStorage.toTreeViewArray());
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

  const onDoubleClick = useCallback(
    (value: TreeViewItemData<SavedQueryItem>) => {
      if (tabs.find((tab) => tab.key === value.id)) setSelectedTab(value.id);
      else {
        newWindow(
          value.text ?? '',
          (key, name) => (
            <QueryWindow
              name={name}
              tabKey={key}
              initialSql={value?.data?.sql ?? ''}
            />
          ),
          {
            icon: <FontAwesomeIcon icon={faCode} />,
            overrideKey: value.id,
          }
        );
      }
    },
    [tabs, setSelectedTab, newWindow]
  );

  const { handleContextMenu } = useContextMenu(() => {
    return [
      {
        text: 'New Query',
        onClick: newQueryCallback,
      },
      {
        text: 'New Folder',
        icon: <FontAwesomeIcon icon={faFolder} color="#f39c12" />,
        separator: true,
        onClick: newFolderCallback,
      },
      {
        text: 'Rename',
        separator: true,
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
        draggable
        items={tree}
        selected={selectedKey}
        onDoubleClick={onDoubleClick}
        onSelectChange={setSelectedKey}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
