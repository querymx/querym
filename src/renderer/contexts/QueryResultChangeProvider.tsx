import ResultChangeCollector from 'libs/ResultChangeCollector';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const QueryResultChangeContext = createContext<{
  setChange: (row: number, col: number, value: unknown) => void;
  removeChange: (row: number, col: number) => void;
  changeCount: number;
}>({
  changeCount: 0,
  setChange: () => {
    throw 'Not implemented';
  },
  removeChange: () => {
    throw 'Not implemented';
  },
});

export function useQueryResultChange() {
  return useContext(QueryResultChangeContext);
}

export function QueryResultChangeProvider({ children }: PropsWithChildren) {
  const collector = useMemo(() => new ResultChangeCollector(), []);
  const [changeCount, setChangeCount] = useState(0);

  const setChange = useCallback(
    (row: number, col: number, value: unknown) => {
      collector.add(row, col, value);
      setChangeCount(collector.getChangesCount());
    },
    [collector, setChangeCount]
  );

  const removeChange = useCallback(
    (row: number, col: number) => {
      collector.remove(row, col);
      setChangeCount(collector.getChangesCount());
    },
    [collector, setChangeCount]
  );

  return (
    <QueryResultChangeContext.Provider
      value={{ changeCount, removeChange, setChange }}
    >
      {children}
    </QueryResultChangeContext.Provider>
  );
}
