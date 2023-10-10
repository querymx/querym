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
  console.log(config);

  return (
    <Stack vertical>
      <RelationalDbConnectionEditor config={config} onChange={onChange} />
    </Stack>
  );
}
