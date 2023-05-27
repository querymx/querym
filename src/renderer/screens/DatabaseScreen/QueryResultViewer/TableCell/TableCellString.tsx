import styles from './styles.module.css';
import { useState, useCallback } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';

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
  return <div className={styles.content}>{(value as number).toString()}</div>;
}

const TableCellString = createTableCellType({
  diff: (prev: string, current: string) => prev !== current,
  content: TableCellStringContent,
  editor: TableCellStringEditor,
});

export default TableCellString;
