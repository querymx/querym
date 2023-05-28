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
import { useTableCellManager } from '../TableCellManager';

export interface TableEditableCellHandler {
  discard: () => void;
  setFocus: (focused: boolean) => void;
}

export interface TableEditableEditorProps {
  value: unknown;
  readOnly?: boolean;
  onExit: (discard: boolean, value: unknown) => void;
}

export interface TableEditableContentProps {
  value: unknown;
}

interface TableEditableCellProps {
  diff: (prev: unknown, current: unknown) => boolean;
  editor: React.FC<TableEditableEditorProps>;
  detactEditor?: boolean;
  content: React.FC<TableEditableContentProps>;
  row: number;
  col: number;
  value: unknown;
  readOnly?: boolean;
}

const TableEditableCell = forwardRef(function TableEditableCell(
  {
    diff,
    detactEditor,
    editor: Editor,
    content: Content,
    col,
    row,
    value,
    readOnly,
  }: TableEditableCellProps,
  ref: Ref<TableEditableCellHandler>
) {
  const { cellManager } = useTableCellManager();
  const { setChange, removeChange, collector } = useQueryResultChange();
  const [afterValue, setAfterValue] = useState(
    collector.getChange(row, col, value)
  );
  const [onEditMode, setOnEditMode] = useState(false);
  const [onFocus, setFocus] = useState(false);

  useImperativeHandle(
    ref,
    () => {
      return {
        discard: () => {
          setAfterValue(value);
          removeChange(row, col);
        },
        setFocus,
      };
    },
    [setAfterValue, value, row, col, setFocus]
  );

  const hasChanged = useMemo(
    () => diff(afterValue, value),
    [afterValue, value, diff]
  );

  const onEnterEditMode = useCallback(() => {
    if (!onEditMode) {
      setOnEditMode(true);
    }
  }, [onEditMode, setOnEditMode]);

  const handleFocus = useCallback(() => {
    if (!onFocus) {
      cellManager.setFocus(row, col);
    }
  }, [setFocus, cellManager, onFocus, row, col]);

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

  const className = [
    styles.container,
    hasChanged ? styles.changed : undefined,
    onFocus ? styles.focused : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      onClick={handleFocus}
      onDoubleClick={onEnterEditMode}
    >
      {onEditMode ? (
        detactEditor ? (
          <>
            <Editor
              value={afterValue}
              onExit={onExitEditMode}
              readOnly={readOnly}
            />
            <Content value={afterValue} />
          </>
        ) : (
          <Editor
            value={afterValue}
            onExit={onExitEditMode}
            readOnly={readOnly}
          />
        )
      ) : (
        <Content value={afterValue} />
      )}
    </div>
  );
});

export default TableEditableCell;
