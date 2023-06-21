import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import { Decimal } from 'decimal.js';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellInput from 'renderer/components/ResizableTable/TableCellInput';

function TableCellDecimalEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps) {
  const [editValue, setEditValue] = useState(value as string);

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(false, editValue);
    }
  }, [onExit, editValue]);

  return (
    <TableCellInput
      readOnly={readOnly}
      alignRight
      onChange={setEditValue}
      onLostFocus={onLostFocus}
      value={editValue}
    />
  );
}

function TableCellDecimalContent({ value }: TableEditableContentProps) {
  return <TableCellContent right value={value} />;
}

const TableCellDecimal = createTableCellType({
  diff: (prev: string, current: string) => {
    if (prev && current) {
      const dprev = new Decimal(prev);
      const dcur = new Decimal(current);
      return !dprev.eq(dcur);
    }
    return prev !== current;
  },
  content: TableCellDecimalContent,
  editor: TableCellDecimalEditor,
});

export default TableCellDecimal;
