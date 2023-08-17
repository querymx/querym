import {
  ConnectionStoreConfig,
  MySqlConnectionConfig,
} from 'drivers/SQLLikeConnection';
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
      <PasswordField
        label="Password"
        value={config?.password}
        onChange={(value) => onChange({ ...config, password: value })}
      />
      <TextField
        label="Database"
        value={config?.database}
        onChange={(value) => onChange({ ...config, database: value })}
      />
    </Stack>
  );
}
