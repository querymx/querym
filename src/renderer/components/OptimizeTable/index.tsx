import { useState, ReactElement, useRef, useMemo } from 'react';
import styles from './styles.module.css';
import { ContextMenuItemProps } from '../ContextMenu';
import useTableVisibilityRecalculation from './useTableVisibilityRecalculation';
import useTableSelectionHandler from './useTableSelectionHandler';
import TableFakeBodyPadding from './TableFakeBodyPadding';
import TableFakeRowPadding from './TableFakeRowPadding';
import TableHeaderList from './TableHeaderList';

export interface OptimizeTableHeaderProps {
  name: string;
  initialSize: number;
  resizable?: boolean;
  icon?: ReactElement;
  rightIcon?: ReactElement;
  tooltip?: string;
  menu?: ContextMenuItemProps[];
}

interface OptimizeTableProps {
  data: unknown[];
  headers: OptimizeTableHeaderProps[];
  renderCell: (y: number, x: number) => ReactElement;
  rowHeight: number;
  renderAhead: number;

  newRowsIndex?: number[];
  removedRowsIndex?: number[];

  selectedRowsIndex: number[]; // Array of selected row indices
  onSelectedRowsIndexChanged: (selectedRows: number[]) => void; // Callback for row selection changes
}

export default function OptimizeTable({
  data,
  headers,
  renderCell,
  rowHeight,
  renderAhead,
  newRowsIndex,
  removedRowsIndex,
  selectedRowsIndex,
  onSelectedRowsIndexChanged,
}: OptimizeTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [headerSizes] = useState(() => {
    return headers.map((header) => header.initialSize);
  });

  const { visibileRange, onHeaderResize } = useTableVisibilityRecalculation({
    containerRef,
    headerSizes,
    renderAhead,
    rowHeight,
    totalRowCount: data.length,
  });

  const { rowStart, rowEnd, colEnd, colStart } = visibileRange;

  const { handleRowClick, newRowsIndexSet, removedRowsIndexSet } =
    useTableSelectionHandler({
      onSelectedRowsIndexChanged,
      selectedRowsIndex,
      newRowsIndex,
      removedRowsIndex,
    });

  return useMemo(() => {
    const windowArray = new Array(rowEnd - rowStart)
      .fill(false)
      .map(() => new Array(headers.length).fill(false));

    const cells = windowArray.map((row, rowIndex) => {
      const absoluteRowIndex = rowIndex + rowStart;

      let rowClass = undefined;

      if (newRowsIndexSet.has(absoluteRowIndex)) {
        rowClass = styles.newRow;
      } else if (removedRowsIndexSet.has(absoluteRowIndex)) {
        rowClass = styles.removedRow;
      } else if (selectedRowsIndex.includes(absoluteRowIndex)) {
        rowClass = styles.selectedRow;
      }

      return (
        <TableFakeRowPadding
          key={absoluteRowIndex}
          className={rowClass ?? ''}
          onMouseDown={(e) => handleRowClick(e, absoluteRowIndex)}
          colCount={headerSizes.length}
          colEnd={colEnd}
          colStart={colStart}
        >
          {row.slice(colStart, colEnd + 1).map((_, cellIndex) => (
            <td key={cellIndex + colStart}>
              <div className={styles.tableCellContent}>
                {renderCell(absoluteRowIndex, cellIndex + colStart)}
              </div>
            </td>
          ))}
        </TableFakeRowPadding>
      );
    });

    return (
      <div ref={containerRef} className={`${styles.tableContainer} scroll`}>
        <div
          style={{
            height: (data.length + 1) * rowHeight + 10,
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              gridTemplateColumns: headerSizes
                .map((header) => header + 'px')
                .join(' '),
            }}
          >
            <TableHeaderList
              headers={headers}
              onHeaderResize={onHeaderResize}
            />

            <TableFakeBodyPadding
              colCount={headerSizes.length}
              rowCount={data.length}
              rowEnd={rowEnd}
              rowStart={rowStart}
              rowHeight={rowHeight}
            >
              {cells}
            </TableFakeBodyPadding>
          </table>
        </div>
      </div>
    );
  }, [
    rowEnd,
    rowStart,
    colEnd,
    colStart,
    data,
    renderCell,
    headerSizes,
    rowHeight,
    headers,
    onHeaderResize,
    selectedRowsIndex,
    newRowsIndexSet,
    removedRowsIndexSet,
  ]);
}
