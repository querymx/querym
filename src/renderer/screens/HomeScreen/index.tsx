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
import { faCircleDot, faFolder } from '@fortawesome/free-solid-svg-icons';
import ListViewEmptyState from 'renderer/components/ListView/ListViewEmptyState';

const WELCOME_SCREEN_ID = '00000000000000000000';

export function sortConnection(tree: ConnectionConfigTree[]) {
  const tmp = [...tree];
  tmp.sort((a, b) => {
    if (a.nodeType === 'folder' && b.nodeType === 'folder')
      return a.name.localeCompare(b.name);
    else if (a.nodeType === 'folder') {
      return -1;
    } else if (b.nodeType === 'folder') {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
  return tmp;
}

export default function HomeScreen() {
  const { connect } = useConnection();

  const { connections, setConnections, initialCollapsed, saveCollapsed } =
    useIndexDbConnection();
  const [selectedItem, setSelectedItem] = useState<
    TreeViewItemData<ConnectionConfigTree> | undefined
  >({ id: WELCOME_SCREEN_ID });
  const [selectedItemChanged, setSelectedItemChanged] =
    useState<ConnectionStoreItem>();

  const [collapsedKeys, setCollapsedKeys] = useState<string[] | undefined>(
    initialCollapsed
  );

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
              <FontAwesomeIcon icon={faFolder} color="#f39c12" />
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

    const welcomeNode = {
      id: WELCOME_SCREEN_ID,
      icon: (
        <FontAwesomeIcon icon={faCircleDot} color={'var(--color-critical)'} />
      ),
      text: 'Welcome to QueryMaster',
    } as TreeViewItemData<ConnectionConfigTree>;

    if (connections) {
      const treeNode = buildTree(connections);
      return {
        treeItems: treeNode.length > 0 ? [welcomeNode, ...treeNode] : [],
        treeDict,
      };
    }

    return { treeItems: [], treeDict };
  }, [connections]);

  const setSaveCollapsedKeys = useCallback(
    (keys: string[] | undefined) => {
      setCollapsedKeys(keys?.filter((key) => !!treeDict[key]));
      saveCollapsed(keys ?? []);
    },
    [setCollapsedKeys, saveCollapsed, treeDict]
  );

  // -----------------------------------------------
  // Handle save database
  // -----------------------------------------------
  const onSaveClick = useCallback(() => {
    if (selectedItemChanged && selectedItem?.data && connections) {
      selectedItem.text = selectedItemChanged.name;
      selectedItem.data.name = selectedItemChanged.name;
      selectedItem.data.config = selectedItemChanged;
      setConnections([...connections]);
    }
  }, [connections, selectedItem, selectedItemChanged, setConnections]);

  const handleDragAndOverItem = useCallback(
    (
      from: TreeViewItemData<ConnectionConfigTree>,
      to: TreeViewItemData<ConnectionConfigTree>
    ) => {
      if (connections) {
        let toData;

        // You cannot drag anything into connection
        if (to.data?.nodeType === 'connection') {
          if (to.data?.parentId) {
            const parentTo = treeDict[to.data.parentId];
            if (parentTo) {
              toData = parentTo;
            }
          }
        } else {
          toData = to.data;
        }

        const fromData = from.data;
        if (!fromData) return;

        let newConnection = connections;

        // Remove itself from its parent;
        if (fromData.parentId) {
          const parent = treeDict[fromData.parentId];
          if (parent?.children) {
            parent.children = parent.children.filter(
              (child) => child.id !== fromData.id
            );
          }
        } else {
          newConnection = connections.filter(
            (child) => child.id !== fromData.id
          );
        }

        if (toData) {
          fromData.parentId = toData.id;
          toData.children = sortConnection([
            ...(toData.children || []),
            fromData,
          ]);
        } else {
          fromData.parentId = undefined;
          newConnection = [...newConnection, fromData];
        }

        setConnections(sortConnection(newConnection));
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

        const parent = treeDict[selectedItem.id];
        if (parent?.children) {
          parent.children = sortConnection(parent.children);
        }

        setConnections(sortConnection(connections));
      }
      setRenameSelectedItem(false);
    },
    [
      treeDict,
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
    setSaveCollapsedKeys,
    collapsedKeys,
    setSelectedItem,
    setConnections,
    setRenameSelectedItem,
    selectedItem,
    treeDict,
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
            onCollapsedChange={setSaveCollapsedKeys}
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
            emptyState={
              <ListViewEmptyState text="There is no database setting. Right click to create new setting." />
            }
          />
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
          ) : !selectedItem?.data?.nodeType ? (
            <WelcomeScreen />
          ) : (
            <div />
          )}
        </div>
      </SplitterLayout>
    </div>
  );
}
