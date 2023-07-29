import { useCallback, useState, useEffect } from 'react';

interface StatusBarConnection {
  version?: string;
  status?: string;
}

const MESSAGE_CHANNEL = 'status-bar-connection';

export function useStatusBar() {
  const setStatusBarConnectionStatus = useCallback(
    (data?: StatusBarConnection) => {
      window.postMessage({
        type: MESSAGE_CHANNEL,
        data,
      });
    },
    []
  );

  return { setStatusBarConnectionStatus };
}

export function useStatusBarData() {
  const [connectionStatus, setConnectionStatus] = useState<
    StatusBarConnection | undefined
  >();

  useEffect(() => {
    const receiveMessage = (
      e: MessageEvent<{ type: string; data?: StatusBarConnection }>
    ) => {
      if (e.data?.type === MESSAGE_CHANNEL) {
        setConnectionStatus((prev) => {
          if (e.data?.data) return { ...prev, ...e.data?.data };
          return undefined;
        });
      }
    };

    window.addEventListener('message', receiveMessage);
    return () => window.removeEventListener('message', receiveMessage);
  }, [setConnectionStatus]);

  return { connectionStatus };
}
