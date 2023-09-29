import { ConnectionStoreConfig } from 'drivers/base/SQLLikeConnection';
import RelationalDbConnectionEditor from './RelationalDbConnectionEditor';
import Stack from 'renderer/components/Stack';

export default function PostgreConnectionEditor({
  config,
  onChange,
}: {
  config: ConnectionStoreConfig;
  onChange: (value: ConnectionStoreConfig) => void;
}) {
  return (
    <Stack vertical>
      <RelationalDbConnectionEditor config={config} onChange={onChange} />
      <label>
        <input
          type="checkbox"
          checked={config?.ssl}
          onChange={(e) =>
            onChange({ ...config, ssl: e.currentTarget.checked })
          }
        />
        &nbsp;Over SSL
      </label>
    </Stack>
  );
}
