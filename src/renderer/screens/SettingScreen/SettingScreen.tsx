import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useMemo, useState } from 'react';
import Button from 'renderer/components/Button';
import KeyboardKey from 'renderer/components/KeyboardKey';
import Modal from 'renderer/components/Modal';
import OverlayScreen from 'renderer/components/OverlayScreen';
import Table from 'renderer/components/Table';
import TextField from 'renderer/components/TextField';
import {
  KeybindingDescription,
  useKeybinding,
} from 'renderer/contexts/KeyBindingProvider';
import {
  EVENT_OPEN_SETTING_SCREEN,
  useListenEvent,
} from 'renderer/hooks/usePublishEvent';
import KeyMatcher from 'renderer/utils/KeyMatcher';

export default function SettingScreen() {
  const [open, setOpen] = useState(false);
  const [editKeybinding, setEditKeybinding] = useState('');
  const [editKeyCombination, setEditKeyCombination] = useState<KeyMatcher>();
  const { binding, setBinding } = useKeybinding();

  useListenEvent(
    EVENT_OPEN_SETTING_SCREEN,
    () => {
      setOpen(true);
    },
    [setOpen],
  );

  const bindingList = useMemo(() => {
    return Object.entries(binding);
  }, [binding]);

  const onCloseEditingKey = useCallback(() => {
    setEditKeyCombination(undefined);
    setEditKeybinding('');
  }, [setEditKeybinding, setEditKeyCombination]);

  return (
    <>
      <OverlayScreen open={open} onClose={() => setOpen(false)}>
        <h1>Keybinding</h1>

        <br />
        <br />

        <Table>
          <thead>
            <tr>
              <th>Command</th>
              <th>Keybinding</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {bindingList.map(([name, key]) => {
              return (
                <tr key={name}>
                  <td>{KeybindingDescription[name]?.title ?? name}</td>
                  <td>
                    <KeyboardKey name={key.toString()} />
                  </td>
                  <td>
                    <FontAwesomeIcon
                      onClick={() => {
                        setEditKeybinding(name);
                        setEditKeyCombination(key);
                      }}
                      icon={faPencil}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </OverlayScreen>

      {editKeybinding && (
        <Modal open title="Editing" onClose={onCloseEditingKey}>
          <Modal.Body>
            <TextField
              autoFocus
              readOnly
              onKeyDown={(e) => {
                const newKey = KeyMatcher.capture(e);
                setEditKeyCombination(newKey);
                e.preventDefault();
              }}
              value={editKeyCombination?.toString()}
              label={'Press desired key view combination and then press Enter'}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              primary
              onClick={() => {
                if (editKeyCombination) {
                  setBinding(editKeybinding, editKeyCombination);
                  onCloseEditingKey();
                }
              }}
            >
              Change
            </Button>
            <Button onClick={onCloseEditingKey}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
