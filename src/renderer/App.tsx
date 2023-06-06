import './App.css';
import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import DatabaseScreen from './screens/DatabaseScreen';
import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import { SqlExecuteProvider } from './contexts/SqlExecuteProvider';
import { ContextMenuProvider } from './contexts/ContextMenuProvider';
import { DialogProvider } from './contexts/DialogProvider';
import AppFeatureContext from './contexts/AppFeatureProvider';
import NativeMenuProvider from './contexts/NativeMenuProvider';

export default function App() {
  const [config, setConfig] = useState<ConnectionStoreItem | undefined>();

  return (
    <AppFeatureContext>
      <ContextMenuProvider>
        <DialogProvider>
          <NativeMenuProvider>
            <SqlExecuteProvider>
              <div style={{ width: '100vw', height: '100vh' }}>
                {config ? (
                  <DatabaseScreen config={config} />
                ) : (
                  <HomeScreen onNavigateToDatabaseConfig={setConfig} />
                )}
              </div>
            </SqlExecuteProvider>
          </NativeMenuProvider>
        </DialogProvider>
      </ContextMenuProvider>
    </AppFeatureContext>
  );
}
