import { useCallback, useMemo } from 'react';

export default function useTableSelectionHandler({
  newRowsIndex,
  removedRowsIndex,
  onSelectedRowsIndexChanged,
  selectedRowsIndex,
}: {
  newRowsIndex?: number[];
  removedRowsIndex?: number[];
  onSelectedRowsIndexChanged: (selectedRows: number[]) => void;
  selectedRowsIndex: number[];
}) {
  const newRowsIndexSet = useMemo(
    () => new Set(newRowsIndex ?? []),
    [newRowsIndex]
  );

  const removedRowsIndexSet = useMemo(
    () => new Set(removedRowsIndex ?? []),
    [removedRowsIndex]
  );

  const handleRowSelection = useCallback(
    (rowIndex: number, isCtrlKey: boolean, isShiftKey: boolean) => {
      let updatedSelectedRowsIndex: number[] = [];

      if (isCtrlKey) {
        // If CTRL key is pressed, toggle the selection of the clicked row
        if (selectedRowsIndex.includes(rowIndex)) {
          updatedSelectedRowsIndex = selectedRowsIndex.filter(
            (index) => index !== rowIndex
          );
        } else {
          updatedSelectedRowsIndex = [...selectedRowsIndex, rowIndex];
        }
      } else if (isShiftKey) {
        // If SHIFT key is pressed, select rows from the last selected row to the clicked row
        const lastIndex = selectedRowsIndex[selectedRowsIndex.length - 1];
        const start = Math.min(lastIndex, rowIndex);
        const end = Math.max(lastIndex, rowIndex);

        for (let i = start; i <= end; i++) {
          updatedSelectedRowsIndex.push(i);
        }
      } else {
        updatedSelectedRowsIndex = [rowIndex];
      }

      onSelectedRowsIndexChanged(updatedSelectedRowsIndex);
    },
    [selectedRowsIndex, onSelectedRowsIndexChanged]
  );

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLTableRowElement>, rowIndex: number) => {
      if (e.button === 0) {
        const isCtrlKey = e.ctrlKey || e.metaKey;
        const isShiftKey = e.shiftKey;
        handleRowSelection(rowIndex, isCtrlKey, isShiftKey);
      }
    },
    [handleRowSelection]
  );

  return { newRowsIndexSet, removedRowsIndexSet, handleRowClick };
}
