import {
  MessageBoxSyncOptions,
  dialog,
  SaveDialogSyncOptions,
  shell,
  OpenDialogOptions,
} from 'electron';
import fs from 'fs';
import saveCsvFile from '../../libs/SaveCSVFile';
import saveExcelFile from '../../libs/SaveExcelFile';
import CommunicateHandler from './../CommunicateHandler';

CommunicateHandler.handle(
  'show-message-box',
  ([options]: [MessageBoxSyncOptions], { window }) => {
    if (window) {
      return dialog.showMessageBoxSync(window, options);
    }
    return 0;
  },
)
  .handle('show-open-dialog', ([options]: [OpenDialogOptions], { window }) => {
    if (window) {
      return dialog.showOpenDialog(window, options);
    }
  })
  .handle('read-file', ([fileName]: [string]) => {
    return fs.readFileSync(fileName);
  })
  .handle(
    'show-save-dialog',
    ([options]: [SaveDialogSyncOptions], { window }) => {
      if (window) {
        return dialog.showSaveDialogSync(window, options);
      }
    },
  )
  .handle('save-csv-file', ([fileName, records]: [string, object[]]) => {
    saveCsvFile(fileName, records);
  })
  .handle('save-excel-file', ([fileName, records]: [string, object[]]) => {
    saveExcelFile(fileName, records);
  })
  .handle('show-item-in-folder', ([fileName]: [string]) => {
    shell.showItemInFolder(fileName);
  });
