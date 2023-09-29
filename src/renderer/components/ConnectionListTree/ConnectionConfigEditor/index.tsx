import { ConnectionStoreConfig } from 'drivers/base/SQLLikeConnection';
import MySQLConnectionEditor from './MySQLConnectionEditor';
import PostgreConnectionEditor from './PostgreConnectionEditor copy';

export default function ConnectionConfigEditor({
  type,
  config,
  onChange,
}: {
  type: string;
  config: ConnectionStoreConfig;
  onChange: (value: ConnectionStoreConfig) => void;
}) {
  if (type === 'mysql') {
    return <MySQLConnectionEditor config={config} onChange={onChange} />;
  } else if (type === 'postgre') {
    return <PostgreConnectionEditor config={config} onChange={onChange} />;
  }

  return <div />;
}
