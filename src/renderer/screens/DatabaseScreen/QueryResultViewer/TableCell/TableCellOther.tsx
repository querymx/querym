import { getDisplayableFromDatabaseValue } from 'libs/TransformResult';
import {
  TableEditableContentProps,
  TableEditableEditorProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellInput from 'renderer/components/ResizableTable/TableCellInput';
import { useCallback, useState } from 'react';
import StringType from 'renderer/datatype/StringType';

function TableCellStringEditor({
  value,
  onExit,
  header,
}: TableEditableEditorProps<StringType>) {
  const [editValue, setEditValue] = useState(
    getDisplayableFromDatabaseValue(value, header.columnDefinition),
  );

  const onLostFocus = useCallback(
    (v: string | null | undefined) => {
      if (onExit) {
        onExit(true, new StringType(v));
      }
    },
    [onExit],
  );

  return (
    <TableCellInput
      fullEditor
      readOnly={true}
      onChange={setEditValue}
      onLostFocus={onLostFocus}
      value={editValue}
    />
  );
}

function TableCellStringContent({ header, value }: TableEditableContentProps) {
  return (
    <TableCellContent
      value={getDisplayableFromDatabaseValue(value, header.columnDefinition)}
    />
  );
}

const TableCellOther = createTableCellType({
  readOnly: true,
  editor: TableCellStringEditor,
  diff: (prev: StringType, current: StringType) => prev.diff(current),
  content: TableCellStringContent,
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

export default TableCellOther;
