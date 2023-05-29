import './App.css';
import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import DatabaseScreen from './screens/DatabaseScreen';
import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import { SqlExecuteProvider } from './contexts/SqlExecuteProvider';
import { ContextMenuProvider } from './contexts/ContextMenuProvider';
import { DialogProvider } from './contexts/DialogProvider';
import ThemeProvider from './contexts/ThemeProvider';
import useNativeMenu from './hooks/useNativeMenu';

export default function App() {
  const [config, setConfig] = useState<ConnectionStoreItem | undefined>();

  useNativeMenu(
    () => [
      {
        label: 'File',
        submenu: [
          ...(config ? [{ label: 'Disconnect' }] : []),
          {
            label: 'Exit',
          },
        ],
      },
      {
        label: 'Preference',
        submenu: [
          {
            label: 'Dark Mode',
            type: 'checkbox',
            checked: true,
            id: 'dark-mode',
            click: () => {
              alert('Dark mode');
            },
          },
          { label: 'Light Mode' },
        ],
      },
    ],
    [config]
  );

  return (
    <ThemeProvider defaultTheme="dark">
      <ContextMenuProvider>
        <DialogProvider>
          <SqlExecuteProvider>
            <div style={{ width: '100vw', height: '100vh' }}>
              {config ? (
                <DatabaseScreen config={config} />
              ) : (
                <HomeScreen onNavigateToDatabaseConfig={setConfig} />
              )}
            </div>
          </SqlExecuteProvider>
        </DialogProvider>
      </ContextMenuProvider>
    </ThemeProvider>
  );
}
