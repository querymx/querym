import { useEffect } from 'react';
import {
  HotkeyItemOptions,
  getHotkeyHandler,
  getHotkeyMatcher,
} from 'renderer/utils/parseHotkeys';

export type { HotkeyItemOptions };
export { getHotkeyHandler };

export type HotkeyItem = [
  string,
  (event: KeyboardEvent) => void,
  HotkeyItemOptions?
];

function shouldFireEvent(
  event: KeyboardEvent,
  tagsToIgnore: string[],
  triggerOnContentEditable = false
) {
  if (event.target instanceof HTMLElement) {
    if (triggerOnContentEditable) {
      return !tagsToIgnore.includes(event.target.tagName);
    }

    return (
      !event.target.isContentEditable &&
      !tagsToIgnore.includes(event.target.tagName)
    );
  }

  return true;
}

export function useHotkey(
  hotkeys: HotkeyItem[],
  tagsToIgnore: string[] = ['INPUT', 'TEXTAREA', 'SELECT'],
  triggerOnContentEditable = false
) {
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      console.log('event', event);
      hotkeys.forEach(
        ([hotkey, handler, options = { preventDefault: true }]) => {
          if (
            getHotkeyMatcher(hotkey)(event) &&
            shouldFireEvent(event, tagsToIgnore, triggerOnContentEditable)
          ) {
            if (options.preventDefault) {
              event.preventDefault();
            }

            handler(event);
          }
        }
      );
    };

    document.documentElement.addEventListener('keydown', keydownListener);
    return () =>
      document.documentElement.removeEventListener('keydown', keydownListener);
  }, [hotkeys]);
}
