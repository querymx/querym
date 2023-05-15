// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  MessageBoxSyncOptions,
} from 'electron';

export type Channels = 'ipc-example' | 'create-connection';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },

    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },

    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },

  loadConnectionConfig: () => ipcRenderer.invoke('load-connection-config'),
  saveConnectionConfig: (configs: ConnectionStoreItem[]) =>
    ipcRenderer.invoke('save-connection-config', [configs]),

  connect: (storeConfig: ConnectionStoreItem) =>
    ipcRenderer.invoke('connect', [storeConfig]),
  query: (sql: string, params?: Record<string, unknown>) =>
    ipcRenderer.invoke('query', [sql, params]),
  close: () => {
    ipcRenderer.invoke('close');
  },

  showMessageBox: (options: MessageBoxSyncOptions) =>
    ipcRenderer.invoke('show-message-box', [options]),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
