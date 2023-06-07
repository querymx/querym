import styles from './styles.module.css';
import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from './TableCellContent';

function TableCellNumberEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps) {
  const [editValue, setEditValue] = useState<string | null>(
    value !== null ? (value as number).toString() : null
  );

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(false, editValue === null ? editValue : Number(editValue));
    }
  }, [onExit, editValue]);

  return (
    <input
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onLostFocus();
        }
      }}
      autoFocus
      readOnly={readOnly}
      type="text"
      className={`${styles.input} ${styles.number}`}
      onBlur={onLostFocus}
      style={{ textAlign: 'right' }}
      placeholder={editValue === null ? 'NULL' : ''}
      onChange={(e) => setEditValue(e.currentTarget.value)}
      value={editValue || ''}
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
});

export default TableCellNumber;
