import { v1 as uuidv1 } from 'uuid';
import { useCallback, useEffect, useState } from 'react';

import ListView from 'renderer/components/ListView';
import Icon from 'renderer/components/Icon';
import generateDatabaseName from 'renderer/utils/generateDatabaseName';

import {
  ConnectionStoreConfig,
  ConnectionStoreItem,
} from 'drivers/SQLLikeConnection';
import styles from './styles.module.scss';
import DatabaseConfigEditor from './DatabaseConfigEditor';
import ButtonGroup from 'renderer/components/ButtonGroup';
import Button from 'renderer/components/Button';

import deepEqual from 'deep-equal';
import { useDebounce } from 'hooks/useDebounce';
import ListViewEmptyState from 'renderer/components/ListView/ListViewEmptyState';
import WelcomeScreen from './WelcomeScreen';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import { db } from 'renderer/db';

interface HomeScreenProps {
  onNavigateToDatabaseConfig: (config: ConnectionStoreItem) => void;
}

export default function HomeScreen({
  onNavigateToDatabaseConfig,
}: HomeScreenProps) {
  const [connectionList, setConnectionList] = useState<ConnectionStoreItem[]>(
    []
  );
  const [selectedItem, setSelectedItem] = useState<ConnectionStoreItem>();
  const [selectedItemChanged, setSelectedItemChanged] =
    useState<ConnectionStoreItem>();

  useEffect(() => {
    setSelectedItemChanged(selectedItem);
  }, [selectedItem, setSelectedItemChanged]);

  // Check if the selected item has unsaved changed
  const hasChange = useDebounce(
    !!selectedItem &&
      !!selectedItemChanged &&
      !deepEqual(selectedItem, selectedItemChanged),
    200
  );

  useEffect(() => {
    db.table('database_config').toArray().then(setConnectionList);
  }, [setConnectionList]);

  // ----------------------------------------------
  // Handle duplicated database
  // ----------------------------------------------
  const onDuplicateClick = useCallback(() => {
    if (selectedItem) {
      const newDuplicateDatabase: ConnectionStoreItem = {
        ...selectedItem,
        config: { ...selectedItem.config },
        name: generateDatabaseName(connectionList, selectedItem.name),
        id: uuidv1(),
      };

      setConnectionList((prev) => {
        const selectedIndex = prev.findIndex((db) => db.id === selectedItem.id);
        return [
          ...prev.slice(0, selectedIndex + 1),
          newDuplicateDatabase,
          ...prev.slice(selectedIndex + 1),
        ];
      });

      setSelectedItem(newDuplicateDatabase);
      db.table('database_config').put(newDuplicateDatabase);
    }
  }, [selectedItem, setConnectionList, connectionList, setSelectedItem]);

  // ----------------------------------------------
  // Handle remove database
  // ----------------------------------------------
  const onRemoveClick = useCallback(() => {
    if (selectedItem) {
      setConnectionList((prev) =>
        prev.filter((db) => db.id !== selectedItem.id)
      );
      setSelectedItem(undefined);
      db.table('database_config').delete(selectedItem.id);
    }
  }, [selectedItem, setSelectedItem, setConnectionList]);

  // -----------------------------------------------
  // Handle save database
  // -----------------------------------------------
  const onSaveClick = useCallback(() => {
    if (selectedItemChanged) {
      setSelectedItem(selectedItemChanged);
      setConnectionList((prev) =>
        prev.map((db) => {
          if (db.id === selectedItemChanged.id) return selectedItemChanged;
          return db;
        })
      );
      db.table('database_config').put(selectedItemChanged);
    }
  }, [selectedItem, selectedItemChanged, setSelectedItem, setConnectionList]);

  // ----------------------------------------------
  // Handle new connection
  // ----------------------------------------------
  const newMySQLDatabaseSetting = useCallback(() => {
    const newDatabaseSetting = {
      id: uuidv1(),
      name: generateDatabaseName(connectionList, 'Unnamed'),
      type: 'mysql',
      config: {
        database: '',
        host: '',
        password: '',
        port: '3306',
        user: '',
      } as ConnectionStoreConfig,
    };

    setConnectionList((prev) => [...prev, newDatabaseSetting]);
    setSelectedItem(newDatabaseSetting);
  }, [setConnectionList, setSelectedItem, connectionList]);

  const newMariaDatabaseStting = useCallback(() => {
    const newDatabaseSetting = {
      id: uuidv1(),
      name: generateDatabaseName(connectionList, 'Unnamed'),
      type: 'mariadb',
      config: {
        database: '',
        host: '',
        password: '',
        port: '3306',
        user: '',
      } as ConnectionStoreConfig,
    };

    setConnectionList((prev) => [...prev, newDatabaseSetting]);
    setSelectedItem(newDatabaseSetting);
  }, [setConnectionList, setSelectedItem, connectionList]);

  // -----------------------------------------------
  // Handle before select change
  // -----------------------------------------------
  const onBeforeSelectChange = useCallback(async () => {
    if (hasChange && selectedItem) {
      const buttonIndex = await window.electron.showMessageBox({
        title: 'Save modifications?',
        type: 'warning',
        message: `Setting for ${selectedItem.name} were changed`,
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
  }, [selectedItem, onSaveClick, hasChange]);

  const { handleContextMenu } = useContextMenu(() => {
    return [
      {
        text: 'New MySQL Database',
        icon: <Icon.MySql />,
        onClick: newMySQLDatabaseSetting,
      },
      {
        text: 'New MariaDb Database',
        icon: <Icon.MySql />,
        onClick: newMariaDatabaseStting,
        separator: true,
      },
      {
        text: 'Duplicate',
        onClick: onDuplicateClick,
        disabled: !selectedItem,
      },
      {
        text: 'Remove',
        onClick: onRemoveClick,
        disabled: !selectedItem,
        destructive: true,
      },
    ];
  }, [
    newMySQLDatabaseSetting,
    newMariaDatabaseStting,
    onDuplicateClick,
    onRemoveClick,
    selectedItem,
  ]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.connectionList}>
        <ListView
          selectedItem={selectedItem}
          emptyComponent={
            <ListViewEmptyState text="There is no database setting. Right click to create new setting." />
          }
          items={connectionList}
          changeItemKeys={hasChange && selectedItem ? [selectedItem.id] : []}
          onSelectChange={setSelectedItem}
          onBeforeSelectChange={onBeforeSelectChange}
          onDoubleClick={(item) => onNavigateToDatabaseConfig(item)}
          extractMeta={(item) => ({
            icon: <Icon.MySql />,
            text: item.name,
            key: item.id,
          })}
          onContextMenu={handleContextMenu}
        />
      </div>

      <div className={styles.connectionDetail}>
        {selectedItemChanged && (
          <div className={styles.databaseActionFooter}>
            <ButtonGroup>
              <Button
                primary
                onClick={() => onNavigateToDatabaseConfig(selectedItemChanged)}
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
    </div>
  );
}
