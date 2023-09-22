import { useCallback, useEffect, useMemo, useState } from 'react';
import TreeView, { TreeViewItemData } from 'renderer/components/TreeView';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import TreeViewItemStorage from 'libs/TreeViewItemStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faFolder } from '@fortawesome/free-solid-svg-icons';
import { useSavedQueryPubSub } from '../SavedQueryProvider';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import QueryWindow from '../QueryWindow';
import { db } from 'renderer/db';
import { useDatabaseSetting } from 'renderer/contexts/DatabaseSettingProvider';

interface SavedQueryItem {
  sql?: string;
}

export default function SavedQuery() {
  const { setting } = useDatabaseSetting();
  const [tree, setTree] = useState<TreeViewItemData<SavedQueryItem>[]>([]);

  const treeStorage = useMemo(() => {
    const tmp = new TreeViewItemStorage<SavedQueryItem>({
      onIconMapper: (node) => {
        if (node.folder)
          return <FontAwesomeIcon icon={faFolder} color="#f39c12" />;
        return <FontAwesomeIcon icon={faCode} color="#27ae60" />;
      },
      onChange: (self) => {
        setTree(self.toTreeViewArray());
        if (setting?.id) {
          db.table('saved_query').put({
            id: setting.id,
            value: JSON.stringify(self.serialize()),
          });
        }
      },
    });

    if (setting?.id) {
      db.table('saved_query')
        .get(setting.id)
        .then((data) => {
          if (data) {
            tmp.deserialize(JSON.parse(data.value));
            setTree(tmp.toTreeViewArray());
          }
        });
    }

    return tmp;
  }, [setTree, setting]);

  const [renaming, setRenaming] = useState(false);
  const [collapsed, setCollapsed] = useState<string[] | undefined>([]);
  const { newWindow, tabs, setSelectedTab } = useWindowTab();
  const [selectedKey, setSelectedKey] = useState<
    TreeViewItemData<SavedQueryItem> | undefined
  >();

  const { subscribe } = useSavedQueryPubSub();
  useEffect(() => {
    const subInstance = subscribe(({ id, name, sql }) => {
      treeStorage.updateNode(id, name, { sql });
    });
    return () => subInstance.destroy();
  }, [subscribe, treeStorage, setTree]);

  const newFolderCallback = useCallback(() => {
    treeStorage.insertNode({}, 'New Folder', true);
  }, [treeStorage]);

  const newQueryCallback = useCallback(() => {
    treeStorage.insertNode({ sql: '' }, 'New Query', false);
  }, [tree]);

  const renameCallback = useCallback(() => {
    setRenaming(true);
  }, [setRenaming]);

  const removeCallback = useCallback(() => {
    if (selectedKey) {
      treeStorage.removeNode(selectedKey.id);
    }
  }, [selectedKey]);

  const onDoubleClick = useCallback(
    (value: TreeViewItemData<SavedQueryItem>) => {
      if (tabs.find((tab) => tab.key === value.id)) setSelectedTab(value.id);
      else {
        newWindow(
          value.text ?? '',
          () => <QueryWindow initialSql={value?.data?.sql ?? ''} />,
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
        onClick: renameCallback,
        disabled: !selectedKey,
        separator: true,
      },
      {
        destructive: true,
        onClick: removeCallback,
        disabled: !selectedKey,
        text: 'Remove',
      },
    ];
  }, [
    newFolderCallback,
    newQueryCallback,
    renameCallback,
    removeCallback,
    selectedKey,
  ]);

  return (
    <div style={{ height: '100%' }}>
      <TreeView
        draggable
        renameSelectedItem={renaming}
        onRenamedSelectedItem={(newName) => {
          setRenaming(false);
          if (selectedKey && newName) {
            treeStorage.renameNode(selectedKey.id, newName);
          }
        }}
        items={tree}
        collapsedKeys={collapsed}
        onCollapsedChange={setCollapsed}
        selected={selectedKey}
        onDoubleClick={onDoubleClick}
        onSelectChange={setSelectedKey}
        onContextMenu={handleContextMenu}
        onDragItem={(from, to, side) => {
          treeStorage.moveNode(from.id, to.id, side);
        }}
      />
    </div>
  );
}
