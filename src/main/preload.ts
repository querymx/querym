// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  MessageBoxSyncOptions,
  MenuItemConstructorOptions,
} from 'electron';
import {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from 'electron-updater';

export type Channels = 'ipc-example' | 'create-connection';

let cacheHandleMenuClickCb:
  | ((event: IpcRendererEvent, id: string) => void)
  | null = null;

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

  connect: (storeConfig: ConnectionStoreItem) =>
    ipcRenderer.invoke('connect', [storeConfig]),
  query: (sql: string, params?: Record<string, unknown>) =>
    ipcRenderer.invoke('query', [sql, params]),
  close: () => {
    ipcRenderer.invoke('close');
  },

  showMessageBox: (options: MessageBoxSyncOptions): Promise<number> =>
    ipcRenderer.invoke('show-message-box', [options]),

  setNativeMenu: (options: MenuItemConstructorOptions[]) =>
    ipcRenderer.invoke('set-menu', [options]),

  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  handleMenuClick: (
    callback: (event: IpcRendererEvent, id: string) => void
  ) => {
    if (cacheHandleMenuClickCb) {
      ipcRenderer.off('native-menu-click', cacheHandleMenuClickCb);
    }
    cacheHandleMenuClickCb = callback;
    return ipcRenderer.on('native-menu-click', callback);
  },

  listenCheckingForUpdate: (callback: () => void) => {
    ipcRenderer.removeAllListeners('checking-for-update');
    return ipcRenderer.on('checking-for-update', callback);
  },

  listenUpdateAvailable: (
    callback: (event: IpcRendererEvent, e: UpdateInfo) => void
  ) => {
    ipcRenderer.removeAllListeners('update-available');
    return ipcRenderer.on('update-available', callback);
  },

  listenUpdateNotAvailable: (
    callback: (event: IpcRendererEvent, e: UpdateInfo) => void
  ) => {
    ipcRenderer.removeAllListeners('update-not-available');
    return ipcRenderer.on('update-not-available', callback);
  },

  listenUpdateDownloadProgress: (
    callback: (event: IpcRendererEvent, e: ProgressInfo) => void
  ) => {
    ipcRenderer.removeAllListeners('update-download-progress');
    return ipcRenderer.on('update-download-progress', callback);
  },

  listenUpdateDownloaded: (
    callback: (event: IpcRendererEvent, e: UpdateDownloadedEvent) => void
  ) => {
    ipcRenderer.removeAllListeners('update-downloaded');
    return ipcRenderer.on('update-downloaded', callback);
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
