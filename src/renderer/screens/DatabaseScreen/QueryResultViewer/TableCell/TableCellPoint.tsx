import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import TableCellInput from 'renderer/components/ResizableTable/TableCellInput';
import PointType from 'renderer/datatype/PointType';
import { toast } from 'react-toastify';

function parsePoint(text: string | undefined | null) {
  if (text === null) return null;
  if (text === undefined) return undefined;

  const p = text.split(',');

  if (
    p.length !== 2 ||
    !Number.isFinite(Number(p[0].trim())) ||
    !Number.isFinite(Number(p[1].trim()))
  )
    throw new Error('Invalid point format. It must be x,y');

  return { x: Number(p[0]), y: Number(p[1]) };
}

function TableCellPointEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps<PointType>) {
  const [editValue, setEditValue] = useState<string | null | undefined>(
    value.toNullableString(),
  );

  const onLostFocus = useCallback(() => {
    if (onExit) {
      try {
        onExit(false, new PointType(parsePoint(editValue)));
      } catch (e) {
        if (e instanceof Error) {
          toast.error(e.toString());
        }
        onExit(true, undefined);
      }
    }
  }, [onExit, editValue]);

  return (
    <TableCellInput
      readOnly={readOnly}
      onChange={setEditValue}
      onLostFocus={onLostFocus}
      value={editValue}
    />
  );
}

function TableCellPointContent({
  value,
}: TableEditableContentProps<PointType>) {
  return <TableCellContent value={value.toNullableString()} />;
}

const TableCellPoint = createTableCellType({
  diff: (prev: PointType, current: PointType) => prev.diff(current),
  content: TableCellPointContent,
  editor: TableCellPointEditor,
  onInsertValue: (value) => {
    try {
      if (value === null || value === undefined || typeof value === 'string') {
        return new PointType(parsePoint(value));
      }
    } catch {
      return new PointType(undefined);
    }
    return new PointType(undefined);
  },
  onCopy: (value: PointType) => {
    return value.toString();
  },
  onPaste: (value: string) => {
    try {
      return { accept: true, value: new PointType(parsePoint(value)) };
    } catch {
      return { accept: false, value: new PointType(undefined) };
    }
  },
});

export default TableCellPoint;
