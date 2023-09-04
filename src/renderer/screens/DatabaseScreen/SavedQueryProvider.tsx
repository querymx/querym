import NotImplementCallback from 'libs/NotImplementCallback';
import { PropsWithChildren, createContext, useContext } from 'react';
import usePubSub, {
  PubSubSubscribePublish,
  PubSubSubscribeInstance,
} from 'renderer/hooks/usePubSub';

interface SavedQueryPubSubData {
  id: string;
  name: string;
  sql: string;
}

const SavedQueryContext = createContext<{
  subscribe: PubSubSubscribeInstance<SavedQueryPubSubData>;
  publish: PubSubSubscribePublish<SavedQueryPubSubData>;
}>({
  subscribe: NotImplementCallback,
  publish: NotImplementCallback,
});

export function useSavedQueryPubSub() {
  return useContext(SavedQueryContext);
}

export default function SavedQueryProvider({ children }: PropsWithChildren) {
  const { subscribe, publish } = usePubSub<SavedQueryPubSubData>();

  return (
    <SavedQueryContext.Provider value={{ subscribe, publish }}>
      {children}
    </SavedQueryContext.Provider>
  );
}
