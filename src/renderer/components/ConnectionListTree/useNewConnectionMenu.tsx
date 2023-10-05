import {
  ConnectionStoreConfig,
  ConnectionStoreItemWithoutId,
} from 'drivers/base/SQLLikeConnection';
import { useCallback, useMemo } from 'react';
import { ContextMenuItemProps } from 'renderer/components/ContextMenu';
import Icon from 'renderer/components/Icon';
import generateIncrementalName from 'renderer/utils/generateIncrementalName';
import { useConnectionList } from '.';
import { QueryDialetType } from 'libs/QueryBuilder';

export default function useNewConnectionMenu() {
  const { storage, showEditConnection, setShowConnectionStringModal } =
    useConnectionList();

  const newConnection = useCallback(
    (type: QueryDialetType, config: ConnectionStoreConfig) => {
      const newConfig: ConnectionStoreItemWithoutId = {
        name: generateIncrementalName(
          storage.getAll().map((r) => r.name),
          'Unnamed',
        ),
        type,
        createdAt: Math.ceil(Date.now() / 1000),
        lastUsedAt: Math.ceil(Date.now() / 1000),
        config,
      };

      showEditConnection(newConfig);
    },
    [storage, showEditConnection],
  );

  const menu: ContextMenuItemProps[] = useMemo(() => {
    return [
      {
        text: 'MySQL',
        icon: <Icon.MySql />,
        onClick: () =>
          newConnection('mysql', {
            database: '',
            host: 'localhost',
            password: '',
            port: 3306,
            user: '',
          }),
      },
      {
        text: 'PostgreSQL',
        icon: <Icon.PostgreSQL />,
        onClick: () =>
          newConnection('postgre', {
            database: '',
            host: 'localhost',
            password: '',
            port: 5432,
            user: 'postgres',
          }),
      },
      { text: 'SQLite (coming soon)', disabled: true, separator: true },
      {
        text: 'Import from Connection String',
        onClick: () => setShowConnectionStringModal(true),
      },
    ];
  }, [newConnection, setShowConnectionStringModal]);

  return menu;
}
