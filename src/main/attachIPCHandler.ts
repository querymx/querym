import { BrowserWindow } from 'electron';

import OtherIpcHandler from './ipc/other';
import ConnectionIpcHandler from './ipc/handleConnection';
import LinkIPCHandler from './ipc/link';

const handlers = [
  new OtherIpcHandler(),
  new ConnectionIpcHandler(),
  new LinkIPCHandler(),
];

export default function attachIPCHandler(window: BrowserWindow) {
  handlers.forEach((handler) => {
    handler.attachWindow(window);
    handler.register();
  });

  return () => {
    handlers.forEach((handler) => handler.cleanup());
  };
}
