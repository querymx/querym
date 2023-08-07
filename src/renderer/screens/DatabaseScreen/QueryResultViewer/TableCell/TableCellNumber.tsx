import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellInput from 'renderer/components/ResizableTable/TableCellInput';

function TableCellNumberEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps) {
  const [editValue, setEditValue] = useState<string | null | undefined>(
    value !== undefined && value !== null ? (value as number).toString() : value
  );

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(
        false,
        editValue === null || editValue === undefined
          ? editValue
          : Number(editValue)
      );
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

function TableCellNumberContent({ value }: TableEditableContentProps) {
  return <TableCellContent right value={value} />;
}

const TableCellNumber = createTableCellType({
  diff: (prev: number, current: number) => prev !== current,
  content: TableCellNumberContent,
  editor: TableCellNumberEditor,
  onCopy: (value: number) => {
    return value.toString();
  },
  onPaste: (value: string) => {
    return { accept: true, value: Number(value) };
  },
});

export default TableCellNumber;
