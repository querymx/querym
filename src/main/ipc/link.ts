import { ipcMain, shell } from "electron";

export default class LinkIPCHandler {
  register() {
    ipcMain.handle("open-external", (_, [url]: [string]) => {
      shell.openExternal(url);
    });
  }
}
