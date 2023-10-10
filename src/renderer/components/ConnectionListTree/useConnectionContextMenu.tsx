import { useCallback } from 'react';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import useNewConnectionMenu from './useNewConnectionMenu';
import { ConnectionStoreItem } from 'drivers/base/SQLLikeConnection';
import { useConnectionList } from '.';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faRefresh } from '@fortawesome/free-solid-svg-icons';
import ConnectionString from 'libs/ConnectionString';
import { toast } from 'react-toastify';

export default function useConnectionContextMenu({
  selectedItem,
  connectWithRecordUpdate,
}: {
  selectedItem?: ConnectionStoreItem;
  connectWithRecordUpdate: (config: ConnectionStoreItem) => void;
}) {
  const { storage, refresh, showEditConnection, setSelectedItem } =
    useConnectionList();
  const newConnectionMenu = useNewConnectionMenu();

  const onRemoveClick = useCallback(async () => {
    if (selectedItem) {
      const buttonIndex = await window.electron.showMessageBox({
        title: 'Do you want to remove?',
        message: `Do you want to remove ${selectedItem.name}?`,
        buttons: ['Yes', 'No'],
      });

      if (buttonIndex !== 0) return;

      storage.remove(selectedItem.id);
      refresh(true);
      setSelectedItem(undefined);
    }
  }, [selectedItem, storage, setSelectedItem]);

  const { handleContextMenu } = useContextMenu(() => {
    return [
      {
        text: 'Connect',
        disabled: !selectedItem,

        onClick: () => {
          if (selectedItem) {
            connectWithRecordUpdate(selectedItem);
          }
        },
      },
      {
        text: 'Copy Connection String',
        icon: <FontAwesomeIcon icon={faCopy} color="#2980b9" />,
        disabled: !selectedItem,
        onClick: () => {
          if (selectedItem) {
            navigator.clipboard
              .writeText(ConnectionString.encode(selectedItem))
              .then(() => {
                toast('Connection string copied', {
                  position: 'bottom-center',
                  progress: undefined,
                  autoClose: 1000,
                });
              });
          }
        },
      },
      {
        text: 'Refresh',
        separator: true,
        onClick: () => refresh(),
        icon: <FontAwesomeIcon icon={faRefresh} color="#27ae60" />,
      },
      {
        text: 'New Connection',
        children: newConnectionMenu,
      },
      {
        text: 'Edit Connection',
        onClick: () => {
          if (selectedItem) {
            showEditConnection(selectedItem);
          }
        },
        disabled: !selectedItem,
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
    newConnectionMenu,
    selectedItem,
    onRemoveClick,
    showEditConnection,
    connectWithRecordUpdate,
    refresh,
  ]);

  return { handleContextMenu };
}
