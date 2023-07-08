import './App.css';
import { createContext, useCallback, useState, useContext } from 'react';
import HomeScreen from './screens/HomeScreen';
import DatabaseScreen from './screens/DatabaseScreen';
import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import { SqlExecuteProvider } from './contexts/SqlExecuteProvider';
import { ContextMenuProvider } from './contexts/ContextMenuProvider';
import { DialogProvider } from './contexts/DialogProvider';
import AppFeatureContext from './contexts/AppFeatureProvider';
import NativeMenuProvider from './contexts/NativeMenuProvider';
import NotImplementCallback from 'libs/NotImplementCallback';
import Layout from './components/Layout';
import StatusBar from './components/StatusBar';

const ConnectionContext = createContext<{
  connect: (connectionConfig: ConnectionStoreItem) => void;
  disconnect: () => void;
}>({
  connect: NotImplementCallback,
  disconnect: NotImplementCallback,
});

export function useConnection() {
  return useContext(ConnectionContext);
}

export default function App() {
  const [config, setConfig] = useState<ConnectionStoreItem | undefined>();

  const connectCallback = useCallback(
    (connectionConfig: ConnectionStoreItem) => {
      setConfig(connectionConfig);
    },
    [setConfig]
  );

  const disconnectCallback = useCallback(() => {
    setConfig(undefined);
    window.electron.close();
  }, [setConfig]);

  return (
    <AppFeatureContext>
      <ConnectionContext.Provider
        value={{ connect: connectCallback, disconnect: disconnectCallback }}
      >
        <ContextMenuProvider>
          <DialogProvider>
            <NativeMenuProvider>
              <SqlExecuteProvider>
                <div style={{ width: '100vw', height: '100vh' }}>
                  <Layout>
                    <Layout.Grow>
                      {config ? (
                        <DatabaseScreen config={config} />
                      ) : (
                        <HomeScreen />
                      )}
                    </Layout.Grow>
                    <Layout.Fixed>
                      <StatusBar />
                    </Layout.Fixed>
                  </Layout>
                </div>
              </SqlExecuteProvider>
            </NativeMenuProvider>
          </DialogProvider>
        </ContextMenuProvider>
      </ConnectionContext.Provider>
    </AppFeatureContext>
  );
}
