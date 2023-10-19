import './App.css';
import {
  createContext,
  useCallback,
  useState,
  useContext,
  useEffect,
} from 'react';
import HomeScreen from './screens/HomeScreen';
import DatabaseScreen from './screens/DatabaseScreen';
import { ConnectionStoreItem } from 'drivers/base/SQLLikeConnection';
import { SqlExecuteProvider } from './contexts/SqlExecuteProvider';
import { ContextMenuProvider } from './contexts/ContextMenuProvider';
import { DialogProvider } from './contexts/DialogProvider';
import AppFeatureContext from './contexts/AppFeatureProvider';
import NativeMenuProvider from './contexts/NativeMenuProvider';
import NotImplementCallback from 'libs/NotImplementCallback';
import StatusBar from './components/StatusBar';
import { DeviceProvider } from './contexts/DeviceProvider';
import Layout from './components/Layout';
import AuthProvider from './contexts/AuthProvider';
import 'react-toastify/dist/ReactToastify.css';
import SettingScreen from './screens/SettingScreen/SettingScreen';
import { KeyBindingProvider } from './contexts/KeyBindingProvider';

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
    [setConfig],
  );

  const disconnectCallback = useCallback(() => {
    setConfig(undefined);
    window.electron.close();
  }, [setConfig]);

  useEffect(() => {
    window.electron.listen('closing', function () {
      window.isClosing = true;
    });
  });

  return (
    <DeviceProvider>
      <AppFeatureContext>
        <KeyBindingProvider>
          <ConnectionContext.Provider
            value={{ connect: connectCallback, disconnect: disconnectCallback }}
          >
            <AuthProvider>
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
                        <Layout>
                          <Layout.Grow>
                            {config ? (
                              <DatabaseScreen config={config} />
                            ) : (
                              <HomeScreen />
                            )}
                          </Layout.Grow>
                        </Layout>
                        <Layout.Fixed>
                          <StatusBar />
                        </Layout.Fixed>
                      </div>
                      <SettingScreen />
                    </SqlExecuteProvider>
                  </NativeMenuProvider>
                </DialogProvider>
              </ContextMenuProvider>
            </AuthProvider>
          </ConnectionContext.Provider>
        </KeyBindingProvider>
      </AppFeatureContext>
    </DeviceProvider>
  );
}
