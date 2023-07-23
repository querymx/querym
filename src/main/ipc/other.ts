import {
  BrowserWindow,
  MessageBoxSyncOptions,
  dialog,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  SaveDialogSyncOptions,
  shell,
} from 'electron';
import saveCsvFile from './../../libs/SaveCSVFile';
import saveExcelFile from './../../libs/SaveExcelFile';

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

    ipcMain.handle(
      'show-save-dialog',
      (_, [options]: [SaveDialogSyncOptions]) => {
        if (this.window) {
          return dialog.showSaveDialogSync(this.window, options);
        }
      }
    );

    ipcMain.handle(
      'save-csv-file',
      (_, [fileName, records]: [string, object[]]) => {
        saveCsvFile(fileName, records);
      }
    );

    ipcMain.handle(
      'save-excel-file',
      (_, [fileName, records]: [string, object[]]) => {
        saveExcelFile(fileName, records);
      }
    );

    ipcMain.handle('show-item-in-folder', (_, [fileName]: [string]) => {
      shell.showItemInFolder(fileName);
    });
  }

  attachWindow(window: BrowserWindow) {
    this.window = window;
  }
}
