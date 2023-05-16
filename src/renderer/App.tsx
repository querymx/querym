import './App.css';
import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import DatabaseScreen from './screens/DatabaseScreen';
import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import { SqlExecuteProvider } from './contexts/SqlExecuteProvider';
import { ContextMenuProvider } from './contexts/ContextMenuProvider';

export default function App() {
  const [config, setConfig] = useState<ConnectionStoreItem | undefined>();

  return (
    <ContextMenuProvider>
      <SqlExecuteProvider>
        <div style={{ width: '100vw', height: '100vh' }}>
          {config ? (
            <DatabaseScreen config={config} />
          ) : (
            <HomeScreen onNavigateToDatabaseConfig={setConfig} />
          )}
        </div>
      </SqlExecuteProvider>
    </ContextMenuProvider>
  );
}
