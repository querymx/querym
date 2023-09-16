import { ElectronHandler } from 'main/preload';

declare global {
  interface Window {
    electron: ElectronHandler;
    env: { env: string };
    isClosing: boolean;
  }
}

export {};
