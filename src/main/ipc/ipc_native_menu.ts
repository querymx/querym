import { MenuItemConstructorOptions, BrowserWindow, Menu } from 'electron';
import CommunicateHandler from './../CommunicateHandler';

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

CommunicateHandler.handle(
  'set-menu',
  ([options]: [MenuItemConstructorOptions[]], { window }) => {
    if (window) {
      const menu = Menu.buildFromTemplate(
        recursiveAttachClick(options, window)
      );
      window.setMenu(menu);
      Menu.setApplicationMenu(menu);
    }
  }
);
