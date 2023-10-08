import NotImplementCallback from 'libs/NotImplementCallback';
import ResultChangeCollector from 'libs/ResultChangeCollector';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import BaseType from 'renderer/datatype/BaseType';

import { TableEditableCellHandler } from 'renderer/screens/DatabaseScreen/QueryResultViewer/TableCell/TableEditableCell';

export class TableCellManager {
  protected focused: [number, number] | null = null;
  protected cells: Record<
    string,
    Record<string, TableEditableCellHandler | null>
  > = {};

  setFocus(row: number, col: number) {
    this.clearFocus();
    this.focused = [row, col];

    const cell = this.cells[row][col];
    if (cell) {
      cell.setFocus(true);
    }
  }

  getFocus() {
    return this.focused ? [...this.focused] : null;
  }

  getFocusCell() {
    if (this.focused) {
      return this.get(this.focused[0], this.focused[1]);
    }
    return null;
  }

  clearFocus() {
    if (this.focused) {
      const cell = this.cells[this.focused[0]][this.focused[1]];
      if (cell) {
        cell.setFocus(false);
      }
    }
    this.focused = null;
  }

  set(row: number, col: number, ref: TableEditableCellHandler | null) {
    if (this.cells[row]) {
      this.cells[row][col] = ref;
    } else {
      this.cells[row] = {};
      this.cells[row][col] = ref;
    }
  }

  get(row: number, col: number) {
    if (this.cells[row]) {
      return this.cells[row][col];
    }
    return null;
  }
}

const QueryResultChangeContext = createContext<{
  setChange: (row: number, col: number, value: BaseType) => void;
  removeChange: (row: number, col: number) => void;
  collector: ResultChangeCollector;
  clearChange: () => void;
  cellManager: TableCellManager;
}>({
  collector: new ResultChangeCollector(),
  setChange: NotImplementCallback,
  removeChange: NotImplementCallback,
  clearChange: NotImplementCallback,
  cellManager: new TableCellManager(),
});

export function useEditableResult() {
  return useContext(QueryResultChangeContext);
}

export function EditableQueryResultProvider({ children }: PropsWithChildren) {
  const collector = useMemo(() => new ResultChangeCollector(), []);
  const manager = useMemo(() => new TableCellManager(), []);

  const setChange = useCallback(
    (row: number, col: number, value: BaseType) => {
      collector.addChange(row, col, value);
    },
    [collector],
  );

  const removeChange = useCallback(
    (row: number, col: number) => {
      collector.removeChange(row, col);
    },
    [collector],
  );

  const clearChange = useCallback(() => {
    collector.clear();
  }, [collector]);

  return (
    <QueryResultChangeContext.Provider
      value={{
        removeChange,
        setChange,
        collector,
        clearChange,
        cellManager: manager,
      }}
    >
      {children}
    </QueryResultChangeContext.Provider>
  );
}
