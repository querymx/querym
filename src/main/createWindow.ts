import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { resolveHtmlPath } from './util';
import handleAutoUpdate from './autoupdate';
import CommunicateHandler from './CommunicateHandler';

export default function createWindow({ onClose }: { onClose: () => void }) {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  CommunicateHandler.attachWindow(mainWindow);

  handleAutoUpdate(mainWindow);

  mainWindow.setMenu(null);
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', () => {
    mainWindow.webContents.send('closing');
  });

  mainWindow.on('closed', () => {
    CommunicateHandler.executeCleanup();
    onClose();
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  return mainWindow;
}
