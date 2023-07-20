import { createContext, PropsWithChildren, useMemo, useContext } from 'react';
import { TableEditableCellHandler } from './TableCell/TableEditableCell';

class TableCellManager {
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

const TableCellManagerContext = createContext<{
  cellManager: TableCellManager;
}>({
  cellManager: new TableCellManager(),
});

export function useTableCellManager() {
  return useContext(TableCellManagerContext);
}

export function TableCellManagerProvider({ children }: PropsWithChildren) {
  const manager = useMemo(() => new TableCellManager(), []);

  return (
    <TableCellManagerContext.Provider value={{ cellManager: manager }}>
      {children}
    </TableCellManagerContext.Provider>
  );
}
