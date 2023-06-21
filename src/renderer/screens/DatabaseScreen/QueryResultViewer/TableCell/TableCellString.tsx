import styles from './styles.module.css';
import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from './TableCellContent';

function TableCellStringEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps) {
  const [editValue, setEditValue] = useState(value);

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(false, editValue);
    }
  }, [onExit, editValue]);

  return (
    <input
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onLostFocus();
        }
      }}
      spellCheck="false"
      autoFocus
      type="text"
      readOnly={readOnly}
      className={styles.input}
      onBlur={onLostFocus}
      onChange={(e) => setEditValue(e.currentTarget.value)}
      value={editValue as string}
    />
  );
}

function TableCellStringContent({ value }: TableEditableContentProps) {
  return <TableCellContent value={value} />;
}

const TableCellString = createTableCellType({
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

export default TableCellString;
