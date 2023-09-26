import {
  ConnectionStoreConfig,
  MySqlConnectionConfig,
} from 'drivers/base/SQLLikeConnection';
import MySQLConnectionEditor from './MySQLConnectionEditor';

export default function ConnectionConfigEditor({
  type,
  config,
  onChange,
}: {
  type: string;
  config: ConnectionStoreConfig;
  onChange: (value: ConnectionStoreConfig) => void;
}) {
  if (type === 'mysql' || type === 'postgre') {
    return (
      <MySQLConnectionEditor
        config={config as MySqlConnectionConfig}
        onChange={onChange}
      />
    );
  }

  return <div />;
}
