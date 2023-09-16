import { autoUpdater } from 'electron-updater';
import CommunicateHandler from './../CommunicateHandler';

let globalCheckForUpdate = false;

CommunicateHandler.handle('check-for-updates', () => {
  if (globalCheckForUpdate) return;
  globalCheckForUpdate = true;

  // DO NOT CHECK FOR UPDATE FOR WINDOW
  // Because the window certificate is too expensive,
  // we will only build appx and upload it to Microsoft Store
  // It is only $19 one-time. The auto updater does not work
  // in Microsoft Store
  if (!process.platform.startsWith('win')) {
    autoUpdater.checkForUpdates();
  }
});

CommunicateHandler.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});
