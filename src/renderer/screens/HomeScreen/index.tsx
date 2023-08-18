import { useCallback, useEffect, useState, useMemo } from 'react';
import Icon from 'renderer/components/Icon';

import {
  ConnectionConfigTree,
  ConnectionStoreItem,
} from 'drivers/SQLLikeConnection';
import styles from './styles.module.scss';
import DatabaseConfigEditor from './DatabaseConfigEditor';
import ButtonGroup from 'renderer/components/ButtonGroup';
import Button from 'renderer/components/Button';

import deepEqual from 'deep-equal';
import { useDebounce } from 'hooks/useDebounce';
import WelcomeScreen from '../WelcomeScreen';
import { useConnection } from 'renderer/App';
import SplitterLayout from 'renderer/components/Splitter/Splitter';
import { useIndexDbConnection } from 'renderer/hooks/useIndexDbConnections';
import TreeView, { TreeViewItemData } from 'renderer/components/TreeView';
import useConnectionContextMenu from './useConnectionContextMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

export default function HomeScreen() {
  const { connect } = useConnection();

  const { connections, setConnections } = useIndexDbConnection();
  const [selectedItem, setSelectedItem] =
    useState<TreeViewItemData<ConnectionConfigTree>>();
  const [selectedItemChanged, setSelectedItemChanged] =
    useState<ConnectionStoreItem>();

  const [collapsedKeys, setCollapsedKeys] = useState<string[] | undefined>([]);

  useEffect(() => {
    setSelectedItemChanged(selectedItem?.data?.config);
  }, [selectedItem, setSelectedItemChanged]);

  // Check if the selected item has unsaved changed
  const hasChange = useDebounce(
    !!selectedItem?.data &&
      !!selectedItemChanged &&
      !deepEqual(selectedItem.data.config, selectedItemChanged),
    200
  );

  const [renameSelectedItem, setRenameSelectedItem] = useState(false);

  const { treeItems, treeDict } = useMemo(() => {
    const treeDict: Record<string, ConnectionConfigTree> = {};

    function buildTree(
      configs: ConnectionConfigTree[]
    ): TreeViewItemData<ConnectionConfigTree>[] {
      return configs.map((config) => {
        treeDict[config.id] = config;

        return {
          id: config.id,
          data: config,
          icon:
            config.nodeType === 'folder' ? (
              <FontAwesomeIcon icon={faFolder} />
            ) : (
              <Icon.MySql />
            ),
          text: config.name,
          children:
            config.children && config.children.length > 0
              ? buildTree(config.children)
              : undefined,
        };
      });
    }

    if (connections) {
      return { treeItems: buildTree(connections), treeDict };
    }

    return { treeItems: [], treeDict };
  }, [connections]);

  // ----------------------------------------------
  // Handle duplicated database
  // ----------------------------------------------
  // const onDuplicateClick = useCallback(() => {
  //   if (selectedItem) {
  //     const newDuplicateDatabase: ConnectionStoreItem = {
  //       ...selectedItem,
  //       config: { ...selectedItem.config },
  //       name: generateDatabaseName(connectionList, selectedItem.name),
  //       id: uuidv1(),
  //     };

  //     setConnectionList((prev) => {
  //       const selectedIndex = prev.findIndex((db) => db.id === selectedItem.id);
  //       return [
  //         ...prev.slice(0, selectedIndex + 1),
  //         newDuplicateDatabase,
  //         ...prev.slice(selectedIndex + 1),
  //       ];
  //     });

  //     setSelectedItem(newDuplicateDatabase);
  //     db.table('database_config').put(newDuplicateDatabase);
  //   }
  // }, [selectedItem, setConnectionList, connectionList, setSelectedItem]);

  // // ----------------------------------------------
  // // Handle remove database
  // // ----------------------------------------------
  // const onRemoveClick = useCallback(() => {
  //   if (selectedItem) {
  //     setConnectionList((prev) =>
  //       prev.filter((db) => db.id !== selectedItem.id)
  //     );
  //     setSelectedItem(undefined);
  //     db.table('database_config').delete(selectedItem.id);
  //   }
  // }, [selectedItem, setSelectedItem, setConnectionList]);

  // // -----------------------------------------------
  // // Handle save database
  // // -----------------------------------------------
  const onSaveClick = useCallback(() => {
    if (selectedItemChanged && selectedItem?.data && connections) {
      selectedItem.text = selectedItemChanged.name;
      selectedItem.data.name = selectedItemChanged.name;
      selectedItem.data.config = selectedItemChanged;
      setSelectedItem(selectedItem);
      setConnections([...connections]);
    }
  }, [connections, selectedItem, selectedItemChanged, setConnections]);

  const handleDragAndOverItem = useCallback(
    (
      from: TreeViewItemData<ConnectionConfigTree>,
      to: TreeViewItemData<ConnectionConfigTree>
    ) => {
      if (connections) {
        // You cannot drag anything into connection
        if (to.data?.nodeType === 'connection') return;

        const fromData = from.data;
        const toData = to.data;

        if (!toData) return;
        if (!fromData) return;

        // Remove itself from its parent;
        if (fromData.parentId) {
          const parent = treeDict[fromData.parentId];
          if (parent && parent.children) {
            parent.children = parent.children.filter(
              (child) => child.id !== fromData.id
            );
          }
        }

        fromData.parentId = toData.id;
        toData.children = [...(toData.children || []), fromData];

        setConnections([
          ...connections.filter((child) => child.id !== fromData.id),
        ]);
      }
    },
    [treeDict, connections, setConnections]
  );

  const handleRenameExit = useCallback(
    (newValue: string | null) => {
      if (connections && selectedItem && newValue) {
        selectedItem.text = newValue;
        if (selectedItem.data) {
          selectedItem.data.name = newValue;
          if (selectedItem.data.config) {
            selectedItem.data.config.name = newValue;
          }
        }

        setSelectedItemChanged((prev) =>
          prev ? { ...prev, name: newValue } : prev
        );
        setConnections([...connections]);
      }
      setRenameSelectedItem(false);
    },
    [
      connections,
      setConnections,
      selectedItem,
      setSelectedItemChanged,
      setRenameSelectedItem,
    ]
  );

  // -----------------------------------------------
  // Handle before select change
  // -----------------------------------------------
  const onBeforeSelectChange = useCallback(async () => {
    if (hasChange && selectedItemChanged) {
      const buttonIndex = await window.electron.showMessageBox({
        title: 'Save modifications?',
        type: 'warning',
        message: `Setting for ${selectedItemChanged.name} were changed`,
        buttons: ['Yes', 'No', 'Cancel'],
      });

      if (buttonIndex === 0) {
        onSaveClick();
      }

      if (buttonIndex === 2) {
        return false;
      }
    }

    return true;
  }, [selectedItemChanged, onSaveClick, hasChange]);

  const { handleContextMenu } = useConnectionContextMenu({
    connections,
    setSelectedItem,
    setConnections,
    setRenameSelectedItem,
  });

  return (
    <div className={styles.dashboard}>
      <SplitterLayout
        secondaryMinSize={200}
        primaryIndex={1}
        secondaryInitialSize={300}
        primaryMinSize={500}
      >
        <div className={styles.connectionList}>
          <TreeView
            draggable
            renameSelectedItem={renameSelectedItem}
            onRenamedSelectedItem={handleRenameExit}
            onDragItem={handleDragAndOverItem}
            items={treeItems}
            onCollapsedChange={setCollapsedKeys}
            collapsedKeys={collapsedKeys}
            onSelectChange={setSelectedItem}
            onDoubleClick={(item) => {
              if (item.data?.config) {
                connect(item.data?.config);
              }
            }}
            selected={selectedItem}
            onBeforeSelectChange={onBeforeSelectChange}
            onContextMenu={handleContextMenu}
          />
          {/* <ListViewEmptyState text="There is no database setting. Right click to create new setting." /> */}
        </div>

        <div className={styles.connectionDetail}>
          {selectedItemChanged && (
            <div className={styles.databaseActionFooter}>
              <ButtonGroup>
                <Button
                  primary
                  onClick={() => {
                    if (hasChange) {
                      window.electron
                        .showMessageBox({
                          title: 'Save Your Change',
                          message:
                            'Do you want to save this connection setting?',
                          buttons: ['Yes', 'No'],
                        })
                        .then((buttonIdx) => {
                          if (buttonIdx === 0) {
                            onSaveClick();
                          }
                          connect(selectedItemChanged);
                        });
                    } else {
                      connect(selectedItemChanged);
                    }
                  }}
                >
                  Connect
                </Button>
                <Button primary onClick={onSaveClick} disabled={!hasChange}>
                  Save
                </Button>
              </ButtonGroup>
            </div>
          )}

          {selectedItemChanged ? (
            <div className={styles.databaseDetailContainer}>
              <DatabaseConfigEditor
                key={selectedItemChanged.id}
                value={selectedItemChanged}
                onChange={setSelectedItemChanged}
              />
            </div>
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </SplitterLayout>
    </div>
  );
}
