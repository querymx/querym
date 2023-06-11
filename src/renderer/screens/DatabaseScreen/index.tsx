import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import { useState, useEffect, useCallback } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudBolt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Stack from 'renderer/components/Stack';
import Button from 'renderer/components/Button';
import ButtonGroup from 'renderer/components/ButtonGroup';
import { useConnection } from 'renderer/App';

function DatabaseScreenBody() {
  const { common } = useSqlExecute();
  const { disconnect } = useConnection();
  const [schema, setSchema] = useState<DatabaseSchemas | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSchema = useCallback(() => {
    setLoading(true);
    common
      .getSchema()
      .then((data) => {
        setSchema(data);
      })
      .catch((e) => {
        setError(true);
        setErrorMessage(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setSchema, setError, setErrorMessage, common, setLoading]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  if (loading) {
    return (
      <Stack full center>
        <Stack vertical center>
          <FontAwesomeIcon icon={faSpinner} spin fontSize={40} />
        </Stack>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack full center>
        <Stack vertical center>
          <FontAwesomeIcon icon={faCloudBolt} fontSize={40} />
          <div>{errorMessage}</div>

          <div>
            <ButtonGroup>
              <Button
                primary
                onClick={() => {
                  disconnect();
                }}
              >
                Go Back
              </Button>
              <Button
                onClick={() => {
                  fetchSchema();
                }}
              >
                Retry
              </Button>
            </ButtonGroup>
          </div>
        </Stack>
      </Stack>
    );
  }

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
