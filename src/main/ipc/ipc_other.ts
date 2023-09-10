import { shell } from 'electron';
import CommunicateHandler from './../CommunicateHandler';

CommunicateHandler.handle('open-external', ([url]: [string]) => {
  shell.openExternal(url);
});
