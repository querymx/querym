import {
  ConnectionStoreConfig,
  MySqlConnectionConfig,
} from 'drivers/base/SQLLikeConnection';
import Stack from 'renderer/components/Stack';
import TextField from 'renderer/components/TextField';
import PasswordField from 'renderer/components/PasswordField';

export default function MySQLConnectionEditor({
  config,
  onChange,
}: {
  config: MySqlConnectionConfig;
  onChange: (value: ConnectionStoreConfig) => void;
}) {
  return (
    <Stack vertical>
      <Stack>
        <div style={{ flexGrow: 1 }}>
          <TextField
            label="Host"
            value={config?.host}
            onChange={(value) => onChange({ ...config, host: value })}
          />
        </div>
        <div style={{ width: 150 }}>
          <TextField
            label="Port"
            value={config?.port}
            onChange={(value) => onChange({ ...config, port: value })}
          />
        </div>
      </Stack>

      <Stack>
        <div style={{ width: '50%' }}>
          <TextField
            label="Username"
            value={config?.user}
            onChange={(value) => onChange({ ...config, user: value })}
          />
        </div>
        <div style={{ width: '50%' }}>
          <PasswordField
            label="Password"
            value={config?.password}
            onChange={(value) => onChange({ ...config, password: value })}
          />
        </div>
      </Stack>

      <TextField
        label="Database"
        value={config?.database}
        onChange={(value) => onChange({ ...config, database: value })}
      />
    </Stack>
  );
}
