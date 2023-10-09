import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellInput from 'renderer/components/ResizableTable/TableCellInput';
import StringType from 'renderer/datatype/StringType';

function TableCellDateStringEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps<StringType>) {
  const [editValue, setEditValue] = useState(value.toNullableString());

  const onLostFocus = useCallback(
    (v: string | null | undefined) => {
      if (onExit) {
        onExit(false, new StringType(v));
      }
    },
    [onExit],
  );

  return (
    <TableCellInput
      readOnly={readOnly}
      onChange={setEditValue}
      onLostFocus={onLostFocus}
      value={editValue}
    />
  );
}

function TableCellDateStringContent({ value }: TableEditableContentProps) {
  return <TableCellContent value={value} />;
}

const TableCellDateString = createTableCellType({
  diff: (prev: StringType, current: StringType) => prev.diff(current),
  content: TableCellDateStringContent,
  editor: TableCellDateStringEditor,
  onInsertValue: (value) => {
    if (value === null || value === undefined || typeof value === 'string')
      return new StringType(value);
    return new StringType(null);
  },
  onCopy: (value: StringType) => {
    return value.toString();
  },
  onPaste: (value: string) => {
    return { accept: true, value: new StringType(value) };
  },
});

export default TableCellDateString;
