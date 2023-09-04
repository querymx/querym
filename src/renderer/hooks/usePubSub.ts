import { useCallback, useMemo } from 'react';

export type PubSubSubscribePublish<T> = (value: T) => void;
export type PubSubSubscribeInstance<T> = (value: PubSubSubscribePublish<T>) => {
  destroy: () => void;
};

export default function usePubSub<T>() {
  const obv = useMemo<{ callback: PubSubSubscribePublish<T>[] }>(() => {
    return { callback: [] };
  }, []);

  const subscribe = useCallback(
    (callback: PubSubSubscribePublish<T>) => {
      obv.callback.push(callback);
      return {
        destroy: () => {
          obv.callback.filter((r) => r !== callback);
        },
      };
    },
    [obv]
  );

  const publish = useCallback(
    (value: T) => {
      for (const callback of obv.callback) {
        callback(value);
      }
    },
    [obv]
  );

  return { subscribe, publish };
}
