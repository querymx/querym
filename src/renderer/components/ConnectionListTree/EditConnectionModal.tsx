import { useState, useCallback } from 'react';
import { ConnectionStoreItemWithoutId } from 'drivers/base/SQLLikeConnection';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';
import DatabaseConfigEditor from './DatabaseConfigEditor';
import { useConnectionList } from '.';
import ConnectionIcon from '../ConnectionIcon';

export default function EditConnectionModal({
  initialValue,
}: {
  initialValue: ConnectionStoreItemWithoutId;
}) {
  const { finishEditing, refresh, storage, setSelectedItem } =
    useConnectionList();
  const [value, setValue] = useState(initialValue);

  const onSave = useCallback(() => {
    storage
      .save(value)
      .then((newItem) => {
        refresh(true);
        finishEditing();
        setSelectedItem({ id: newItem.id, data: newItem });
      })
      .catch(console.error);
  }, [finishEditing, value]);

  return (
    <Modal
      icon={<ConnectionIcon dialect={initialValue.type} />}
      title={initialValue.id ? 'Edit Connection' : 'New Connection'}
      open
      minWidth={600}
      maxWidth={600}
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
