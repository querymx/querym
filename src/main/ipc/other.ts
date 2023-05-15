import {
  BrowserWindow,
  MessageBoxSyncOptions,
  dialog,
  ipcMain,
} from 'electron';

export default class OtherIpcHandler {
  protected window?: BrowserWindow;

  register() {
    ipcMain.handle(
      'show-message-box',
      (_, [options]: [MessageBoxSyncOptions]): number => {
        if (this.window) {
          return dialog.showMessageBoxSync(this.window, options);
        }
        return 0;
      }
    );
  }

  attachWindow(window: BrowserWindow) {
    this.window = window;
  }
}
