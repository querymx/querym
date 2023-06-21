import styles from './TableCellInput.module.scss';

interface TableCellInputProps {
  onLostFocus?: () => void;
  readOnly?: boolean;
  value?: string | null;
  alignRight?: boolean;
  onChange?: (value: string) => void;
}

export default function TableCellInput({
  onLostFocus,
  readOnly,
  value,
  onChange,
  alignRight,
}: TableCellInputProps) {
  return (
    <input
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          if (onLostFocus) {
            onLostFocus();
          }
        }
      }}
      spellCheck="false"
      autoFocus
      type="text"
      readOnly={readOnly}
      className={styles.input}
      style={alignRight ? { textAlign: 'right' } : undefined}
      onBlur={onLostFocus}
      onChange={(e) => {
        if (onChange) onChange(e.currentTarget.value);
      }}
      value={value || ''}
    />
  );
}
