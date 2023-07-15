import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellSelect from 'renderer/components/ResizableTable/TableCellSelect';

function TableCellStringEditor({
  value,
  onExit,
  readOnly,
  header,
}: TableEditableEditorProps) {
  const [editValue, setEditValue] = useState(value as string);

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(false, editValue);
    }
  }, [onExit, editValue]);

  return (
    <TableCellSelect
      items={header.columnDefinition?.enumValues || []}
      readOnly={readOnly}
      onChange={setEditValue}
      onLostFocus={onLostFocus}
      value={editValue}
    />
  );
}

function TableCellStringContent({ value }: TableEditableContentProps) {
  return <TableCellContent value={value} />;
}

const TableCellEnum = createTableCellType({
  diff: (prev: string, current: string) => prev !== current,
  content: TableCellStringContent,
  editor: TableCellStringEditor,
  onCopy: (value: string) => {
    return value;
  },
  onPaste: (value: string) => {
    return { accept: true, value };
  },
});

export default TableCellEnum;
