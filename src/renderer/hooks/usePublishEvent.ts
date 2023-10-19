import { useCallback, useEffect } from 'react';

export const EVENT_OPEN_SETTING_SCREEN = 'OPEN_SETTING_SCREEN';

export function publishEvent<T>(eventName: string, data?: T) {
  return window.postMessage({
    type: eventName,
    data,
  });
}

export function useListenEvent<T = unknown>(
  eventName: string,
  callback: (data?: T) => void,
  deps?: unknown[],
) {
  const cb = useCallback(callback, deps ?? []);

  useEffect(() => {
    const receiveMessage = (e: MessageEvent<{ type: string; data?: T }>) => {
      if (e.data?.type === eventName) cb(e.data?.data);
    };

    window.addEventListener('message', receiveMessage);
    return () => window.removeEventListener('message', receiveMessage);
  }, [cb]);
}
