import {
  ConnectionStoreConfig,
  MySqlConnectionConfig,
} from 'drivers/SQLLikeConnection';
import Stack from 'renderer/components/Stack';
import TextField from 'renderer/components/TextField';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

interface MySqlConnectionEditorState {
  showPassword: boolean;
}

export default function MySQLConnectionEditor({
  config,
  onChange,
}: {
  config: MySqlConnectionConfig;
  onChange: (value: ConnectionStoreConfig) => void;
}) {
  //Using generic states for future configurations on this component
  const [state, setState] = useState<MySqlConnectionEditorState>({
    showPassword: false,
  });

  return (
    <Stack vertical>
      <TextField
        label="Host"
        value={config?.host}
        onChange={(value) => onChange({ ...config, host: value })}
      />
      <div style={{ width: 150 }}>
        <TextField
          label="Port"
          value={config?.port}
          onChange={(value) => onChange({ ...config, port: value })}
        />
      </div>
      <TextField
        label="Username"
        value={config?.user}
        onChange={(value) => onChange({ ...config, user: value })}
      />
      <TextField
        type={state.showPassword ? 'text' : 'password'}
        label="Password"
        value={config?.password}
        onChange={(value) => onChange({ ...config, password: value })}
        actionIcon={
          <FontAwesomeIcon icon={state.showPassword ? faEye : faEyeSlash} />
        }
        actionClick={() =>
          setState({ ...state, showPassword: !state.showPassword })
        }
      />
      <TextField
        label="Database"
        value={config?.database}
        onChange={(value) => onChange({ ...config, database: value })}
      />
    </Stack>
  );
}
