import { useMemo, useState, useCallback } from 'react';
import styles from './styles.module.css';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';

export interface TableEditableEditorProps<T> {
  value: T;
  onExit?: (discard: boolean, value: T) => void;
}

export interface TableEditableContentProps<T> {
  value: T;
}

interface TableEditableCellProps<T> {
  diff: (prev: T, current: T) => boolean;
  editor: React.FC<TableEditableEditorProps<T>>;
  content: React.FC<TableEditableContentProps<T>>;
  row: number;
  col: number;
  value: T;
}

export default function TableEditableCell<T>({
  diff,
  editor: Editor,
  content: Content,
  col,
  row,
  value,
}: TableEditableCellProps<T>) {
  const [afterValue, setAfterValue] = useState(value);
  const [onEditMode, setOnEditMode] = useState(false);
  const { setChange, removeChange } = useQueryResultChange();

  const hasChanged = useMemo(
    () => diff(afterValue, value),
    [afterValue, value, diff]
  );

  const onEnterEditMode = useCallback(() => {
    if (!onEditMode) {
      setOnEditMode(true);
    }
  }, [onEditMode, setOnEditMode]);

  const onExitEditMode = useCallback(
    (discard: boolean, newValue: T) => {
      setOnEditMode(false);
      if (!discard) {
        setAfterValue(newValue);

        if (diff(value, newValue)) {
          setChange(row, col, newValue);
        } else {
          removeChange(row, col);
        }
      }
    },
    [setOnEditMode, setAfterValue, diff, value]
  );

  return (
    <div
      className={
        hasChanged
          ? `${styles.container} ${styles.number} ${styles.changed}`
          : `${styles.container} ${styles.number}`
      }
      onDoubleClick={onEnterEditMode}
    >
      {onEditMode ? (
        <Editor value={afterValue} onExit={onExitEditMode} />
      ) : (
        <Content value={afterValue} />
      )}
    </div>
  );
}
