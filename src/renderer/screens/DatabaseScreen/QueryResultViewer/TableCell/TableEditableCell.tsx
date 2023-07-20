import {
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  Ref,
  useEffect,
} from 'react';
import styles from './styles.module.css';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';
import { useTableCellManager } from '../TableCellManager';
import { QueryResultHeader } from 'types/SqlResult';

export interface TableEditableCellHandler {
  discard: () => void;
  copy: () => void;
  paste: () => void;
  setFocus: (focused: boolean) => void;
}

export interface TableEditableEditorProps {
  value: unknown;
  header: QueryResultHeader;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCopy?: (value: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPaste?: (value: string) => { accept: boolean; value: any };
  header: QueryResultHeader;
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
    onCopy,
    onPaste,
    header,
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

  const onCopyHandler = useCallback(() => {
    if (onCopy) {
      window.navigator.clipboard.writeText(onCopy(value));
    }
  }, [onCopy, value]);

  const onPasteHandler = useCallback(() => {
    if (onPaste) {
      window.navigator.clipboard.readText().then((pastedValue) => {
        const acceptPasteResult = onPaste(pastedValue);
        if (acceptPasteResult.accept) {
          const newValue = acceptPasteResult.value;
          setAfterValue(newValue);
          if (diff(value, newValue)) {
            setChange(row, col, newValue);
          } else {
            removeChange(row, col);
          }
        }
      });
    }
  }, [onPaste, setAfterValue, setChange, removeChange, diff]);

  useImperativeHandle(
    ref,
    () => {
      return {
        discard: () => {
          setAfterValue(value);
          removeChange(row, col);
        },
        paste: onPasteHandler,
        copy: onCopyHandler,
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

  useEffect(() => {
    if (onFocus) {
      const onKeyBinding = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'c') {
          onCopyHandler();
        } else if (e.ctrlKey && e.key === 'v') {
          onPasteHandler();
        }
      };

      document.addEventListener('keydown', onKeyBinding);
      return () => document.removeEventListener('keydown', onKeyBinding);
    }
  }, [onFocus, onPasteHandler, onCopyHandler]);

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
      onContextMenu={handleFocus}
      onDoubleClick={onEnterEditMode}
    >
      {onEditMode ? (
        detactEditor ? (
          <>
            <Editor
              header={header}
              value={afterValue}
              onExit={onExitEditMode}
              readOnly={readOnly}
            />
            <Content value={afterValue} />
          </>
        ) : (
          <Editor
            header={header}
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
