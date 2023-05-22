import { createContext, PropsWithChildren, useMemo, useContext } from 'react';
import { TableEditableCellRef } from './TableCell/TableEditableCell';

class TableCellManager {
  protected cells: Record<string, Record<string, TableEditableCellRef | null>> =
    {};

  set(row: number, col: number, ref: TableEditableCellRef | null) {
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
