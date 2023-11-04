import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellSelect from 'renderer/components/ResizableTable/TableCellSelect';
import StringType from 'renderer/datatype/StringType';

function TableCellStringEditor({
  value,
  onExit,
  readOnly,
  header,
}: TableEditableEditorProps<StringType>) {
  const [editValue, setEditValue] = useState(value.toNullableString());

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(false, new StringType(editValue));
    }
  }, [onExit, editValue]);

  return (
    <TableCellSelect
      items={[...(header.type?.enumValues ?? [])]}
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
  return <TableCellContent value={value.toNullableString()} />;
}

const TableCellEnum = createTableCellType({
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

export default TableCellEnum;
