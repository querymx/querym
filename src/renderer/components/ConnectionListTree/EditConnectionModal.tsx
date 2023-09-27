import { useState, useCallback } from 'react';
import { ConnectionStoreItemWithoutId } from 'drivers/base/SQLLikeConnection';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';
import DatabaseConfigEditor from './DatabaseConfigEditor';
import { useConnectionList } from '.';

export default function EditConnectionModal({
  initialValue,
}: {
  initialValue: ConnectionStoreItemWithoutId;
}) {
  const { finishEditing, refresh, storage } = useConnectionList();
  const [value, setValue] = useState(initialValue);

  const onSave = useCallback(() => {
    storage
      .save(value)
      .then(() => {
        refresh();
        finishEditing();
      })
      .catch(console.error);
  }, [finishEditing, value]);

  return (
    <Modal
      title={initialValue.id ? 'Edit Connection' : 'New Connection'}
      open
      onClose={finishEditing}
    >
      <Modal.Body>
        <DatabaseConfigEditor value={value} onChange={setValue} />
      </Modal.Body>
      <Modal.Footer>
        <Button primary onClick={onSave}>
          Save
        </Button>
        <Button onClick={finishEditing}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}
