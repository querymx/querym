import styles from './TableCellInput.module.scss';

interface TableCellInputProps {
  onLostFocus?: () => void;
  readOnly?: boolean;
  value?: string | null;
  items: string[];
  onChange?: (value: string) => void;
}

export default function TableCellSelect({
  onLostFocus,
  value,
  onChange,
  items,
}: TableCellInputProps) {
  return (
    <select
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          if (onLostFocus) {
            onLostFocus();
          }
        }
      }}
      spellCheck="false"
      autoFocus
      className={styles.select}
      onBlur={onLostFocus}
      onChange={(e) => {
        if (onChange) onChange(e.currentTarget.value);
      }}
      value={value || ''}
    >
      {items.map((item) => (
        <option>{item}</option>
      ))}
    </select>
  );
}
