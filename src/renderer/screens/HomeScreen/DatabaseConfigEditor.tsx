import {
  ConnectionStoreConfig,
  ConnectionStoreItem,
} from 'drivers/SQLLikeConnection';
import { useCallback, useState } from 'react';
import Stack from 'renderer/components/Stack';
import TextField from 'renderer/components/TextField';
import ConnectionConfigEditor from './ConnectionConfigEditor';
import SideMenu from 'renderer/components/SideMenu';
import Modal from 'renderer/components/Modal';
import Button from 'renderer/components/Button';
import ConnectionString from 'libs/ConnectionString';
import ExportConnectionStringItem from './SideMenuItem/ExportConnectionStringItem';

interface EditConnectionScreenProps {
  value: ConnectionStoreItem;
  onChange: (value: ConnectionStoreItem) => void;
}

export default function DatabaseConfigEditor({
  value,
  onChange,
}: EditConnectionScreenProps) {
  const [open, setOpen] = useState(false);
  const [connectionString, setConnectionString] = useState('');

  const onConfigChanged = useCallback(
    (v: ConnectionStoreConfig) => {
      onChange({ ...value, config: v });
    },
    [value, onChange]
  );

  const onImportConnectionStringClicked = useCallback(() => {
    setOpen(false);
    onChange({ ...value, config: ConnectionString.decode(connectionString) });
    setConnectionString('');
  }, [connectionString, setOpen, onChange]);

  return (
    <div style={{ padding: 20, display: 'flex' }}>
      <div style={{ minWidth: 300, maxWidth: 600, width: '60%' }}>
        <Stack vertical>
          <TextField
            label="Name"
            autoFocus
            value={value.name}
            onChange={(v) => {
              onChange({ ...value, name: v });
            }}
          />

          <ConnectionConfigEditor
            type={value.type || 'mysql'}
            config={value.config}
            onChange={onConfigChanged}
          />
        </Stack>
      </div>

      <Modal
        title="Import Connection String"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Modal.Body>
          <TextField
            autoFocus
            value={connectionString}
            onChange={setConnectionString}
            label={'Connection String'}
            multipleLine
            placeholder="mysql://user:password@host:port"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button primary onClick={onImportConnectionStringClicked}>
            Import
          </Button>
        </Modal.Footer>
      </Modal>

      <div style={{ width: '40%', minWidth: 150 }}>
        <SideMenu>
          <SideMenu.Item
            text="Import from connection string"
            onClick={() => setOpen(true)}
          />
          <ExportConnectionStringItem setting={value} />
        </SideMenu>
      </div>
    </div>
  );
}
