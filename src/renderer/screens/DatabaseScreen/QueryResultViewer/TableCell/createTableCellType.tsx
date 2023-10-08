import React, { useEffect, useRef } from 'react';
import TableEditableCell, {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import { QueryResultHeader } from 'types/SqlResult';
import { useEditableResult } from 'renderer/contexts/EditableQueryResultProvider';
import BaseType from 'renderer/datatype/BaseType';

interface TableCellCustomTypeOptions<T = unknown> {
  diff: (prev: T, current: T) => boolean;
  editor?: React.FC<TableEditableEditorProps<T>>;
  content: React.FC<TableEditableContentProps<T>>;
  detachEditor?: boolean;
  onInsertValue: (value: unknown) => T;
  onCopy?: (value: T) => string;
  onPaste?: (value: string) => { accept: boolean; value: T };
  readOnly?: boolean;
}

export interface TableCellCustomTypeProps<T> {
  row: number;
  col: number;
  value: T;
  readOnly?: boolean;
  header: QueryResultHeader;
}

export default function createTableCellType<T extends BaseType>(
  options: TableCellCustomTypeOptions<T>,
): React.FC<TableCellCustomTypeProps<T>> {
  return function TableCellCustomType({
    row,
    col,
    value,
    readOnly,
    header,
  }: TableCellCustomTypeProps<T>) {
    const ref = useRef(null);
    const { cellManager } = useEditableResult();

    useEffect(() => {
      cellManager.set(row, col, ref?.current || null);
      return () => cellManager.set(row, col, null);
    }, [ref, cellManager, row, col]);

    return (
      <TableEditableCell
        insertValue={options.onInsertValue}
        header={header}
        ref={ref}
        value={value}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        diff={options.diff as any}
        row={row}
        col={col}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor={options.editor as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content={options.content as any}
        readOnly={options.readOnly || readOnly}
        detactEditor={options.detachEditor}
        onCopy={options.onCopy}
        onPaste={options.onPaste}
      />
    );
  };
}
