import styles from './cells.module.scss';

interface CellInputProps {
  onLostFocus?: (value: string | null | undefined) => void;
  readOnly?: boolean;
  value?: string | null;
  alignRight?: boolean;
  onChange?: (value: string) => void;
}

export default function CellSingleLineInput({
  onLostFocus,
  readOnly,
  value,
  onChange,
  alignRight,
}: CellInputProps) {
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
        onBlur={() => {
          if (onLostFocus) onLostFocus(value);
        }}
        onChange={(e) => {
          if (onChange) onChange(e.currentTarget.value);
        }}
        value={value ?? ''}
      />
    </div>
  );
}
