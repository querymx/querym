import { useState, useCallback } from 'react';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';
import TextField from 'renderer/components/TextField';
import { WindowTabItemProps } from 'renderer/contexts/WindowTabProvider';

export default function WindowTabRenameModal({
  initialValue,
  tabKey,
  onClose,
  setTabs,
}: {
  initialValue: string;
  tabKey: string;
  setTabs: React.Dispatch<React.SetStateAction<WindowTabItemProps[]>>;
  onClose: () => void;
}) {
  const [renameValue, setRenameValue] = useState(initialValue);

  const completeRename = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.key === tabKey) {
          return { ...tab, name: renameValue };
        }
        return tab;
      })
    );
    onClose();
  }, [renameValue, setTabs, onClose]);

  return (
    <Modal title="Rename" open onClose={onClose}>
      <Modal.Body>
        <TextField
          autoFocus
          placeholder=""
          label=""
          value={renameValue}
          onChange={setRenameValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              completeRename();
            }
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button primary onClick={completeRename}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
