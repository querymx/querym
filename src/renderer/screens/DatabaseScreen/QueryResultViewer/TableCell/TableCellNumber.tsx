import styles from './styles.module.css';
import { useState, useCallback } from 'react';
import TableEditableCell, {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';

interface TableCellNumberProps {
  value: number;
  row: number;
  col: number;
}

function TableCellNumberEditor({
  value,
  onExit,
}: TableEditableEditorProps<number>) {
  const [editValue, setEditValue] = useState(value.toString());

  const onLostFocus = useCallback(() => {
    if (onExit) {
      onExit(false, Number(editValue));
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
      type="text"
      className={styles.input}
      onBlur={onLostFocus}
      onChange={(e) => setEditValue(e.currentTarget.value)}
      value={editValue}
    />
  );
}

function TableCellNumberContent({ value }: TableEditableContentProps<number>) {
  return <div className={styles.content}>{value}</div>;
}

export default function TableCellNumber({
  value,
  row,
  col,
}: TableCellNumberProps) {
  const diff = useCallback((prev: number, current: number) => {
    return prev !== current;
  }, []);

  return (
    <TableEditableCell
      value={value}
      diff={diff}
      row={row}
      col={col}
      editor={TableCellNumberEditor}
      content={TableCellNumberContent}
    />
  );
}
