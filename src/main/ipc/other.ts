import {
  BrowserWindow,
  MessageBoxSyncOptions,
  dialog,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';

function recursiveAttachClick(
  items: MenuItemConstructorOptions[],
  window: BrowserWindow
): MenuItemConstructorOptions[] {
  return items.map((item) => {
    return {
      ...item,
      submenu: item.submenu
        ? recursiveAttachClick(
            item.submenu as MenuItemConstructorOptions[],
            window
          )
        : undefined,
      click: () => {
        if (item.id) {
          window.webContents.send('native-menu-click', item.id);
        }
      },
    };
  });
}

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

    ipcMain.handle(
      'set-menu',
      (_, [options]: [MenuItemConstructorOptions[]]) => {
        if (this.window) {
          const menu = Menu.buildFromTemplate(
            recursiveAttachClick(options, this.window)
          );
          this.window.setMenu(menu);
          Menu.setApplicationMenu(menu);
        }
      }
    );
  }

  attachWindow(window: BrowserWindow) {
    this.window = window;
  }
}
