// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { ConnectionStoreItem } from 'drivers/base/SQLLikeConnection';
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  MessageBoxSyncOptions,
  MenuItemConstructorOptions,
  SaveDialogSyncOptions,
  OpenDialogOptions,
  OpenDialogReturnValue,
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
  killCurrentQuery: () => ipcRenderer.invoke('kill-current-query'),
  query: (sql: string, params?: Record<string, unknown>) =>
    ipcRenderer.invoke('query', [sql, params]),
  close: () => {
    ipcRenderer.invoke('close');
  },
  showMessageBox: (options: MessageBoxSyncOptions): Promise<number> =>
    ipcRenderer.invoke('show-message-box', [options]),

  // ----------------------------------
  // Related to File O/I
  // ----------------------------------
  showSaveDialog: (
    options: SaveDialogSyncOptions,
  ): Promise<string | undefined> =>
    ipcRenderer.invoke('show-save-dialog', [options]),

  showOpenDialog: (
    options: OpenDialogOptions,
  ): Promise<OpenDialogReturnValue> =>
    ipcRenderer.invoke('show-open-dialog', [options]),

  readFile: (fileName: string): Promise<Buffer> =>
    ipcRenderer.invoke('read-file', [fileName]),

  showFileInFolder: (fileName: string) =>
    ipcRenderer.invoke('show-item-in-folder', [fileName]),

  saveCsvFile: (fileName: string, records: object[]) =>
    ipcRenderer.invoke('save-csv-file', [fileName, records]),

  saveExcelFile: (fileName: string, records: object[]) =>
    ipcRenderer.invoke('save-excel-file', [fileName, records]),
  // ----------------------------------

  setNativeMenu: (options: MenuItemConstructorOptions[]) =>
    ipcRenderer.invoke('set-menu', [options]),

  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  handleMenuClick: (
    callback: (event: IpcRendererEvent, id: string) => void,
  ) => {
    if (cacheHandleMenuClickCb) {
      ipcRenderer.off('native-menu-click', cacheHandleMenuClickCb);
    }
    cacheHandleMenuClickCb = callback;
    return ipcRenderer.on('native-menu-click', callback);
  },

  listenDeeplink: (
    callback: (event: IpcRendererEvent, url: string) => void,
  ) => {
    ipcRenderer.removeAllListeners('deeplink');
    return ipcRenderer.on('deeplink', callback);
  },

  listenCheckingForUpdate: (callback: () => void) => {
    ipcRenderer.removeAllListeners('checking-for-update');
    return ipcRenderer.on('checking-for-update', callback);
  },

  listenUpdateAvailable: (
    callback: (event: IpcRendererEvent, e: UpdateInfo) => void,
  ) => {
    ipcRenderer.removeAllListeners('update-available');
    return ipcRenderer.on('update-available', callback);
  },

  listenUpdateNotAvailable: (
    callback: (event: IpcRendererEvent, e: UpdateInfo) => void,
  ) => {
    ipcRenderer.removeAllListeners('update-not-available');
    return ipcRenderer.on('update-not-available', callback);
  },

  listenUpdateDownloadProgress: (
    callback: (event: IpcRendererEvent, e: ProgressInfo) => void,
  ) => {
    ipcRenderer.removeAllListeners('update-download-progress');
    return ipcRenderer.on('update-download-progress', callback);
  },

  listenUpdateDownloaded: (
    callback: (event: IpcRendererEvent, e: UpdateDownloadedEvent) => void,
  ) => {
    ipcRenderer.removeAllListeners('update-downloaded');
    return ipcRenderer.on('update-downloaded', callback);
  },

  listen: function listen<T = unknown[]>(
    name: string,
    callback: (event: IpcRendererEvent, ...args: T[]) => void,
  ) {
    return ipcRenderer.on(name, callback);
  },

  openExternal: (url: string) => ipcRenderer.invoke('open-external', [url]),

  // Encryption
  encrypt: (text: string, masterKey: string, salt: string) =>
    ipcRenderer.invoke('encrypt', [text, masterKey, salt]),
  decrypt: (encrypted: string, masterKey: string, salt: string) =>
    ipcRenderer.invoke('decrypt', [encrypted, masterKey, salt]),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
