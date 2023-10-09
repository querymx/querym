import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellInput from 'renderer/components/ResizableTable/TableCellInput';
import StringType from 'renderer/datatype/StringType';

function TableCellStringEditor({
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
      fullEditor
      readOnly={readOnly}
      onChange={setEditValue}
      onLostFocus={onLostFocus}
      value={editValue}
    />
  );
}

function TableCellStringContent({
  value,
}: TableEditableContentProps<StringType>) {
  return <TableCellContent value={value.getValue()} />;
}

const TableCellString = createTableCellType({
  diff: (prev: StringType, current: StringType) => prev.diff(current),
  content: TableCellStringContent,
  editor: TableCellStringEditor,
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

export default TableCellString;
