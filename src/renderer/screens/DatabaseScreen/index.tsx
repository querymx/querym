import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import { useState, useEffect } from 'react';
import { SchemaProvider } from 'renderer/contexts/SchemaProvider';
import { DatabaseSettingProvider } from 'renderer/contexts/DatabaseSettingProvider';
import {
  SqlExecuteProvider,
  useSqlExecute,
} from 'renderer/contexts/SqlExecuteProvider';
import { WindowTabProvider } from 'renderer/contexts/WindowTabProvider';
import SqlProtectionProvider from 'renderer/contexts/SqlProtectionProvider';
import { DatabaseSchemas } from 'types/SqlSchema';
import Layout from 'renderer/components/Layout';
import MainToolbar from './MainToolbar';
import MainView from './MainView';

function DatabaseScreenBody() {
  const { common } = useSqlExecute();
  const [schema, setSchema] = useState<DatabaseSchemas | undefined>();

  useEffect(() => {
    common.getSchema().then((data) => {
      setSchema(data);
    });
  }, [setSchema, common]);

  return (
    <SchemaProvider schema={schema}>
      <Layout>
        <Layout.Fixed>
          <MainToolbar />
        </Layout.Fixed>
        <Layout.Grow>
          <MainView />
        </Layout.Grow>
      </Layout>
    </SchemaProvider>
  );
}

export default function DatabaseScreen({
  config,
}: {
  config: ConnectionStoreItem;
}) {
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    window.electron.connect(config).then(() => setConnected(true));
  }, []);

  if (!isConnected) {
    return <div />;
  }

  return (
    <DatabaseSettingProvider setting={config}>
      <SqlExecuteProvider>
        <SqlProtectionProvider>
          <WindowTabProvider>
            <DatabaseScreenBody />
          </WindowTabProvider>
        </SqlProtectionProvider>
      </SqlExecuteProvider>
    </DatabaseSettingProvider>
  );
}
