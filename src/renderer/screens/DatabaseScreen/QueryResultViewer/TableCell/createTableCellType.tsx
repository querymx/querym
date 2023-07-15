import React, { useEffect, useRef } from 'react';
import TableEditableCell, {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import { useTableCellManager } from '../TableCellManager';
import { QueryResultHeader } from 'types/SqlResult';

interface TableCellCustomTypeOptions<T> {
  diff: (prev: T, current: T) => boolean;
  editor: React.FC<TableEditableEditorProps>;
  content: React.FC<TableEditableContentProps>;
  detachEditor?: boolean;
  onCopy?: (value: T) => string;
  onPaste?: (value: string) => { accept: boolean; value: T };
}

export interface TableCellCustomTypeProps<T> {
  row: number;
  col: number;
  value: T;
  readOnly?: boolean;
  header: QueryResultHeader;
}

export default function createTableCellType<T>(
  options: TableCellCustomTypeOptions<T>
): React.FC<TableCellCustomTypeProps<T>> {
  return function TableCellCustomType({
    row,
    col,
    value,
    readOnly,
    header,
  }: TableCellCustomTypeProps<T>) {
    const ref = useRef(null);
    const { cellManager } = useTableCellManager();

    useEffect(() => {
      cellManager.set(row, col, ref?.current || null);
      return () => cellManager.set(row, col, null);
    }, [ref, cellManager, row, col]);

    return (
      <TableEditableCell
        header={header}
        ref={ref}
        value={value}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        diff={options.diff as any}
        row={row}
        col={col}
        editor={options.editor}
        content={options.content}
        readOnly={readOnly}
        detactEditor={options.detachEditor}
        onCopy={options.onCopy}
        onPaste={options.onPaste}
      />
    );
  };
}
