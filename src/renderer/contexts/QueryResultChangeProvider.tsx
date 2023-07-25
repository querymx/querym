import ResultChangeCollector from 'libs/ResultChangeCollector';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';

const QueryResultChangeContext = createContext<{
  setChange: (row: number, col: number, value: unknown) => void;
  removeChange: (row: number, col: number) => void;
  collector: ResultChangeCollector;
  clearChange: () => void;
}>({
  collector: new ResultChangeCollector(),
  setChange: () => {
    throw 'Not implemented';
  },
  removeChange: () => {
    throw 'Not implemented';
  },
  clearChange: () => {
    throw 'Not implemented';
  },
});

export function useQueryResultChange() {
  return useContext(QueryResultChangeContext);
}

export function QueryResultChangeProvider({ children }: PropsWithChildren) {
  const collector = useMemo(() => new ResultChangeCollector(), []);

  const setChange = useCallback(
    (row: number, col: number, value: unknown) => {
      collector.addChange(row, col, value);
    },
    [collector]
  );

  const removeChange = useCallback(
    (row: number, col: number) => {
      collector.removeChange(row, col);
    },
    [collector]
  );

  const clearChange = useCallback(() => {
    collector.clear();
  }, [collector]);

  return (
    <QueryResultChangeContext.Provider
      value={{ removeChange, setChange, collector, clearChange }}
    >
      {children}
    </QueryResultChangeContext.Provider>
  );
}
