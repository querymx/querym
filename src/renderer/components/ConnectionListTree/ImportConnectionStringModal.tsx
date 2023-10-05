import { ConnectionStoreItemWithoutId } from 'drivers/base/SQLLikeConnection';
import Modal from '../Modal';
import Button from '../Button';
import TextAreaField from '../TextField/TextAreaField';
import { useState, useCallback } from 'react';
import ConnectionString from 'libs/ConnectionString';

export default function ImportConnectionStringModal({
  onClose,
  onConnection,
}: {
  onClose: () => void;
  onConnection: (v: ConnectionStoreItemWithoutId) => void;
}) {
  const [connectionString, setConnectionString] = useState('');

  const onImport = useCallback(() => {
    try {
      onConnection(ConnectionString.decode(connectionString));
      onClose();
    } catch (e) {
      console.error(e);
    }
  }, [onConnection, connectionString, onClose]);

  return (
    <Modal open title="Connection String" onClose={onClose}>
      <Modal.Body>
        <TextAreaField
          autoFocus
          placeholder="mysql://root@localhost:3306"
          onChange={setConnectionString}
          value={connectionString}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button primary onClick={onImport}>
          Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
