import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './TableCellInput.module.scss';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import FullTextEditor from './FullTextEditor';

interface TableCellInputProps {
  onLostFocus?: (value: string | null | undefined) => void;
  readOnly?: boolean;
  value?: string | null;
  alignRight?: boolean;
  onChange?: (value: string) => void;
  fullEditor?: boolean;
}

export default function TableCellInput({
  onLostFocus,
  readOnly,
  value,
  onChange,
  alignRight,
  fullEditor,
}: TableCellInputProps) {
  const lineCount = useMemo(() => {
    if (!value) return 1;
    return value.split(/\r\n|\r|\n/).length;
  }, [value]);
  const [showFullEditor, setShowFullEditor] = useState(lineCount > 1);

  return (
    <div className={styles.inputContainer}>
      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            if (onLostFocus) {
              onLostFocus(value);
            }
          }
        }}
        spellCheck="false"
        autoFocus
        type="text"
        readOnly={readOnly}
        className={styles.input}
        style={alignRight ? { textAlign: 'right' } : undefined}
        onBlur={
          showFullEditor
            ? undefined
            : () => {
                if (onLostFocus) onLostFocus(value);
              }
        }
        onChange={(e) => {
          if (onChange) onChange(e.currentTarget.value);
        }}
        value={value ?? ''}
      />
      {fullEditor && (
        <div
          className={styles.more}
          onMouseDown={(e) => {
            setShowFullEditor(true);
            e.preventDefault();
          }}
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </div>
      )}
      {showFullEditor && (
        <FullTextEditor
          readOnly={readOnly}
          onSave={onLostFocus}
          onExit={() => {
            if (onLostFocus) {
              onLostFocus(value);
            }
          }}
          defaultValue={value ?? ''}
        />
      )}
    </div>
  );
}
