import { ConnectionStoreItem } from 'drivers/base/SQLLikeConnection';
import ConnectionString from 'libs/ConnectionString';
import { useCallback, useState } from 'react';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';
import SideMenu from 'renderer/components/SideMenu';
import TextAreaField from 'renderer/components/TextField/TextAreaField';

interface ExportConnectionStringItemProps {
  setting: ConnectionStoreItem;
}

export default function ExportConnectionStringItem({
  setting,
}: ExportConnectionStringItemProps) {
  const [open, setOpen] = useState(false);
  const [connectionString, setConnectionString] = useState('');

  const onCopyClicked = useCallback(() => {
    if (window.navigator.clipboard) {
      window.navigator.clipboard.writeText(connectionString);
    }
  }, [connectionString]);

  const onExportClicked = useCallback(() => {
    setConnectionString(ConnectionString.encode(setting));
    setOpen(true);
  }, [setConnectionString, setting]);

  return (
    <>
      <SideMenu.Item
        text="Export connection string"
        onClick={onExportClicked}
      />
      <Modal
        title="Export Connection String"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Modal.Body>
          <TextAreaField
            readOnly
            autoFocus
            value={connectionString}
            label={'Connection String'}
            placeholder="mysql://user:password@host:port"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button primary onClick={onCopyClicked}>
            Copy
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
