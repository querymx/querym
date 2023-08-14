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
import StatusBar from './components/StatusBar';
import SWRProvider from './contexts/SWRProvider';
import { DeviceProvider } from './contexts/DeviceProvider';

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
    <DeviceProvider>
      <AppFeatureContext>
        <ConnectionContext.Provider
          value={{ connect: connectCallback, disconnect: disconnectCallback }}
        >
          <SWRProvider>
            <ContextMenuProvider>
              <DialogProvider>
                <NativeMenuProvider>
                  <SqlExecuteProvider>
                    <div
                      style={{
                        width: '100vw',
                        height: '100vh',
                        paddingBottom: 26,
                      }}
                    >
                      {config ? (
                        <DatabaseScreen config={config} />
                      ) : (
                        <HomeScreen />
                      )}
                    </div>
                    <StatusBar />
                  </SqlExecuteProvider>
                </NativeMenuProvider>
              </DialogProvider>
            </ContextMenuProvider>
          </SWRProvider>
        </ConnectionContext.Provider>
      </AppFeatureContext>
    </DeviceProvider>
  );
}
