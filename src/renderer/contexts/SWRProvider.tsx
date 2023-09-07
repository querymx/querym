import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { SWRConfig } from 'swr';
import axios from 'axios';
import { useDevice } from './DeviceProvider';

export default function SWRProvider({ children }: PropsWithChildren) {
  const { deviceId } = useDevice();
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    window.electron.listenDeeplink((_, url) => {
      alert(url);
      setToken(url);
      localStorage.setItem('token', url);
    });
  }, [setToken]);

  const fetcher = useCallback(
    (url: string) => {
      const r = axios
        .get(url, {
          headers: {
            'x-device-id': deviceId,
            authorization: token ? 'Bearer ' + token : undefined,
          },
        })
        .then((res) => res.data);
      return r;
    },
    [deviceId]
  );

  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>;
}
