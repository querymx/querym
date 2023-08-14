import { PropsWithChildren, useCallback } from 'react';
import { SWRConfig } from 'swr';
import axios from 'axios';
import { useDevice } from './DeviceProvider';

export default function SWRProvider({ children }: PropsWithChildren) {
  const { deviceId } = useDevice();

  const fetcher = useCallback(
    (url: string) => {
      const r = axios
        .get(url, {
          headers: {
            'x-device-id': deviceId,
          },
        })
        .then((res) => res.data);
      return r;
    },
    [deviceId]
  );

  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>;
}
