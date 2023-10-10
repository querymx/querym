import { ConnectionStoreConfig } from 'drivers/base/SQLLikeConnection';
import Stack from 'renderer/components/Stack';
import TextField from 'renderer/components/TextField';
import PasswordField from 'renderer/components/PasswordField';
import { useState } from 'react';
import CertificatePicker from './CertificatePicker';

export default function RelationalDbConnectionEditor({
  config,
  onChange,
}: {
  config: ConnectionStoreConfig;
  onChange: (value: ConnectionStoreConfig) => void;
}) {
  const [port, setPort] = useState(config?.port?.toString());

  return (
    <>
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
            value={port}
            onChange={(value) => {
              onChange({ ...config, port: Number(value) });
              setPort(value);
            }}
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

      <CertificatePicker
        value={config?.ssl}
        onChange={(value) => onChange({ ...config, ssl: value })}
      />

      <TextField
        label="Database"
        value={config?.database}
        onChange={(value) => onChange({ ...config, database: value })}
      />
    </>
  );
}
