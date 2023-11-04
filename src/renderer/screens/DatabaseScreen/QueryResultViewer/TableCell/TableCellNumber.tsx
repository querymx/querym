import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellInput from 'renderer/components/ResizableTable/TableCellInput';
import NumberType from 'renderer/datatype/NumberType';

function TableCellNumberEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps<NumberType>) {
  const [editValue, setEditValue] = useState<string | null | undefined>(
    value.toNullableString(),
  );

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(false, new NumberType(editValue));
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

function TableCellNumberContent({
  value,
}: TableEditableContentProps<NumberType>) {
  return <TableCellContent right value={value.toNullableString()} />;
}

const TableCellNumber = createTableCellType({
  diff: (prev: NumberType, current: NumberType) => prev.diff(current),
  content: TableCellNumberContent,
  editor: TableCellNumberEditor,
  onInsertValue: (value) => {
    if (
      value === null ||
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number'
    )
      return new NumberType(value);
    return new NumberType(null);
  },
  onCopy: (value: NumberType) => {
    return value.toString();
  },
  onPaste: (value: string) => {
    return { accept: true, value: new NumberType(value) };
  },
});

export default TableCellNumber;
