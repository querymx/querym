import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';

export class AppUpdater {
  protected checkForUpdate = false;

  constructor(window: BrowserWindow) {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    autoUpdater.addListener('checking-for-update', () => {
      window.webContents.send('checking-for-update');
    });

    autoUpdater.addListener('update-available', (e) => {
      window.webContents.send('update-available', e);
    });

    autoUpdater.addListener('update-not-available', (e) => {
      window.webContents.send('update-not-available', e);
    });

    autoUpdater.addListener('download-progress', (e) => {
      window.webContents.send('update-download-progress', e);
    });

    autoUpdater.addListener('update-downloaded', (e) => {
      window.webContents.send('update-downloaded', e);
    });

    ipcMain.handle('check-for-uppdates', () => {
      if (this.checkForUpdate) return;
      this.checkForUpdate = true;
      autoUpdater.checkForUpdates();
    });

    ipcMain.handle('quit-and-install', () => {
      autoUpdater.quitAndInstall();
    });
  }
}
