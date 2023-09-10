/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserWindow, ipcMain } from 'electron';

export default class CommunicateHandler {
  protected static window?: BrowserWindow;
  protected static cleanupList: (() => void)[] = [];

  static handle<T = any>(
    name: string,
    handler: (arg: T, options: { window?: BrowserWindow }) => Promise<any> | any
  ) {
    ipcMain.handle(name, (_, arg) => {
      return handler(arg, { window: this.window });
    });

    return CommunicateHandler;
  }

  static cleanup(handler: () => void) {
    this.cleanupList.push(handler);
  }

  static attachWindow(window: BrowserWindow) {
    this.window = window;
  }

  static executeCleanup() {
    this.cleanupList.forEach((cleanup) => cleanup());
  }
}
