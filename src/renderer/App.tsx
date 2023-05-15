import './App.css';
import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import DatabaseScreen from './screens/DatabaseScreen';
import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import { SqlExecuteProvider } from './contexts/SqlExecuteProvider';

export default function App() {
  const [config, setConfig] = useState<ConnectionStoreItem | undefined>();

  return (
    <SqlExecuteProvider>
      <div style={{ width: '100vw', height: '100vh' }}>
        {config ? (
          <DatabaseScreen config={config} />
        ) : (
          <HomeScreen onNavigateToDatabaseConfig={setConfig} />
        )}
      </div>
    </SqlExecuteProvider>
  );
}
