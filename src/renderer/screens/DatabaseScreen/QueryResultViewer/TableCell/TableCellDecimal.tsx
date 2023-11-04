import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellInput from 'renderer/components/ResizableTable/TableCellInput';
import DecimalType from 'renderer/datatype/DecimalType';

function TableCellDecimalEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps<DecimalType>) {
  const [editValue, setEditValue] = useState(value.toNullableString());

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(false, new DecimalType(editValue));
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

function TableCellDecimalContent({
  value,
}: TableEditableContentProps<DecimalType>) {
  return <TableCellContent right value={value.toNullableString()} />;
}

const TableCellDecimal = createTableCellType({
  diff: (prev: DecimalType, current: DecimalType) => prev.diff(current),
  content: TableCellDecimalContent,
  editor: TableCellDecimalEditor,
  onInsertValue: (value) => {
    if (value === null || value === undefined || typeof value === 'string')
      return new DecimalType(value);
    return new DecimalType(null);
  },
  onCopy: (value: DecimalType) => {
    return value.toString();
  },
  onPaste: (value: string) => {
    return { accept: true, value: new DecimalType(value) };
  },
});

export default TableCellDecimal;
