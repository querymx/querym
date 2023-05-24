import {
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  Ref,
} from 'react';
import styles from './styles.module.css';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';

export type TableEditableCellRef = Ref<{ discard: () => void }>;

export interface TableEditableEditorProps {
  value: unknown;
  onExit?: (discard: boolean, value: unknown) => void;
}

export interface TableEditableContentProps {
  value: unknown;
}

interface TableEditableCellProps {
  diff: (prev: unknown, current: unknown) => boolean;
  editor: React.FC<TableEditableEditorProps>;
  content: React.FC<TableEditableContentProps>;
  row: number;
  col: number;
  value: unknown;
  readOnly?: boolean;
}

const TableEditableCell = forwardRef(function TableEditableCell(
  {
    diff,
    editor: Editor,
    content: Content,
    col,
    row,
    value,
    readOnly,
  }: TableEditableCellProps,
  ref: TableEditableCellRef
) {
  const [afterValue, setAfterValue] = useState(value);
  const [onEditMode, setOnEditMode] = useState(false);
  const { setChange, removeChange } = useQueryResultChange();

  useImperativeHandle(
    ref,
    () => {
      return {
        discard: () => setAfterValue(value),
      };
    },
    [setAfterValue, value]
  );

  const hasChanged = useMemo(
    () => diff(afterValue, value),
    [afterValue, value, diff]
  );

  const onEnterEditMode = useCallback(() => {
    if (!onEditMode && !readOnly) {
      setOnEditMode(true);
    }
  }, [onEditMode, setOnEditMode, readOnly]);

  const onExitEditMode = useCallback(
    (discard: boolean, newValue: unknown) => {
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
});

export default TableEditableCell;
