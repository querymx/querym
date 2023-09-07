import { BrowserWindow } from 'electron';

export default abstract class BaseIpcHandler {
  protected window?: BrowserWindow;

  attachWindow(window: BrowserWindow) {
    this.window = window;
  }

  abstract register(): void;
  abstract cleanup(): void;
}
