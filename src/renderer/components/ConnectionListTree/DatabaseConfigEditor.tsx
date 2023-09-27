import {
  ConnectionStoreConfig,
  ConnectionStoreItemWithoutId,
} from 'drivers/base/SQLLikeConnection';
import { useCallback } from 'react';
import Stack from 'renderer/components/Stack';
import TextField from 'renderer/components/TextField';
import ConnectionConfigEditor from './ConnectionConfigEditor';

interface EditConnectionScreenProps {
  value: ConnectionStoreItemWithoutId;
  onChange: (value: ConnectionStoreItemWithoutId) => void;
}

export default function DatabaseConfigEditor({
  value,
  onChange,
}: EditConnectionScreenProps) {
  const onConfigChanged = useCallback(
    (v: ConnectionStoreConfig) => {
      onChange({ ...value, config: v });
    },
    [value, onChange],
  );

  return (
    <div style={{ minWidth: 300, maxWidth: 600 }}>
      <Stack vertical>
        <TextField
          autoFocus
          label="Name"
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
  );
}
