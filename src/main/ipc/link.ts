import { ipcMain, shell } from 'electron';
import BaseIpcHandler from './base';

export default class LinkIPCHandler extends BaseIpcHandler {
  register() {
    ipcMain.handle('open-external', (_, [url]: [string]) => {
      shell.openExternal(url);
    });
  }

  cleanup() {
    return;
  }
}
