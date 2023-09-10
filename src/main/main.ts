/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import './ipc';
import { BrowserWindow, app } from 'electron';
import path from 'path';
import electronDebug from 'electron-debug';
import sourceMapSupport from 'source-map-support';
import createWindow from './createWindow';

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  electronDebug();
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('querymaster', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('querymaster');
}

const gotTheLock = app.requestSingleInstanceLock();

function createMainWindow() {
  mainWindow = createWindow({
    onClose: () => {
      mainWindow = null;
    },
  });
}

if (!gotTheLock) {
  app.quit();
} else {
  // Handle the deep link for Windows
  app.on('second-instance', (_, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.webContents.send('deeplink', commandLine.pop());
    }
  });

  // Handle the deeplink for Mac OS
  app.on('open-url', (event, url) => {
    if (mainWindow) {
      mainWindow.webContents.send('deeplink', url);
    }
  });

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createMainWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createMainWindow();
    });
  });
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
