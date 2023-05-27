import styles from './styles.module.css';
import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';

function TableCellNumberEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps) {
  const [editValue, setEditValue] = useState((value as number).toString());

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
      readOnly={readOnly}
      type="text"
      className={`${styles.input} ${styles.number}`}
      onBlur={onLostFocus}
      onChange={(e) => setEditValue(e.currentTarget.value)}
      value={editValue}
    />
  );
}

function TableCellNumberContent({ value }: TableEditableContentProps) {
  return (
    <div className={`${styles.content} ${styles.number}`}>
      {(value as number).toString()}
    </div>
  );
}

const TableCellNumber = createTableCellType({
  diff: (prev: number, current: number) => prev !== current,
  content: TableCellNumberContent,
  editor: TableCellNumberEditor,
});

export default TableCellNumber;
