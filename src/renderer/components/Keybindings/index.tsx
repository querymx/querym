import React, { useContext } from 'react';
import Styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Action, useKeybindings } from 'renderer/hooks/useKeybindings';
import { useHotkeyRecorder } from 'renderer/hooks/useHotkeysRecorder';
import Modal from '../Modal';
import { ChildWindowContext } from '../ChildWindow';

export default function Keybindings() {
  const { keybindings, setKeybinding } = useKeybindings();

  const [recordingAction, setRecordingAction] = React.useState<Action | null>();

  const [editModalOpen, setEditModalOpen] = React.useState(false);

  const onSave = (keybinding: string) => {
    if (!recordingAction) return;
    setKeybinding(recordingAction, keybinding);
    setEditModalOpen(false);
  };

  if (!keybindings) return null;

  return (
    <React.Fragment>
      <Modal
        title="Edit Keybinding"
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <EditKeybinding
          onCancel={() => setEditModalOpen(false)}
          onSave={onSave}
        />
      </Modal>
      <div className={Styles.container}>
        <main className={Styles.main}>
          <div className={Styles.main__title}>Keybinds</div>
          <div className={Styles.callout}>
            <FontAwesomeIcon
              icon={faInfoCircle}
              className={Styles.callout__icon}
            />
            <p>All keybindings are disabled in this screen.</p>
          </div>
          <div className={Styles['keybinds-list']}>
            {Object.entries(keybindings).map(([name, keybinding], index) => {
              // if (!isValidAction(name)) return;

              return (
                <div
                  className={Styles['keybinds-list__item']}
                  key={name + index}
                  onClick={() => {
                    setRecordingAction(name as Action);
                    setEditModalOpen(true);
                  }}
                >
                  <div>{name}</div>
                  <div>
                    <span className={Styles['keybinds-list__kbd']}>
                      {keybinding.all}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* <div className={Styles['keybinds-list__item']}>
            <div>Run Query</div>
            <div>
              <span className={Styles['keybinds-list__kbd']}>
                {process.platform === 'darwin' ? '⌘' : 'Ctrl'} + Enter
              </span>
            </div>
          </div> */}
          </div>
        </main>
      </div>
    </React.Fragment>
  );
}

type EditKeybindingProps = {
  onSave: (keybinding: string) => void;
  onCancel: () => void;
};

function EditKeybinding({ onSave, onCancel }: EditKeybindingProps) {
  const currentWindow = useContext(ChildWindowContext);
  const { recordedKeys, stopRecording, clearRecordedKeys } =
    useHotkeyRecorder(currentWindow);

  return (
    <div
      style={{
        background: '#343434',
        padding: '1rem 1.5rem',
      }}
    >
      <p>Press any key combination to set the keybinding, then press save.</p>
      <div
        style={{
          background: 'black',
          padding: '0.5rem 1rem',
          borderRadius: '0.3rem',
          marginTop: '1rem',
          height: '3rem',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {recordedKeys.join(' + ')}
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: '1rem',
        }}
      >
        <div
          style={{
            padding: '0.4rem 1.2rem',

            borderRadius: '0.3rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onCancel}
        >
          Cancel
        </div>
        <div
          style={{
            marginLeft: 'auto',
            padding: '0.4rem 1.2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.3rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={clearRecordedKeys}
        >
          Clear
        </div>
        <div
          onClick={() => {
            stopRecording();
            onSave(recordedKeys.join('+'));
          }}
          style={{
            marginLeft: '1rem',
            padding: '0.4rem 1.2rem',
            background: 'black',
            borderRadius: '0.3rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Save
        </div>
      </div>
    </div>
  );
}
