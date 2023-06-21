import styles from './TableCellContent.module.scss';

export interface TableCellContentProps {
  value: unknown; // Value. It will use to determine NULL/DEFAULT
  displayString?: string; // Override the string for display
  badge?: string;
  color?: string; // Use custom color
  right?: boolean; // Align right
  mono?: boolean; // Using mono font
}

export default function TableCellContent({
  value,
  displayString,
  color,
  right,
  mono,
  badge,
}: TableCellContentProps) {
  const className = [
    styles.wrap,
    value === null || value === undefined ? styles.null : undefined,
    right ? styles.right : undefined,
    mono ? styles.mono : undefined,
  ].join(' ');

  let text = '';

  if (value === null) {
    text = '(NULL)';
  } else if (value === undefined) {
    text = '(DEFAULT)';
  } else {
    text = displayString || value.toString();
  }

  return (
    <div className={className} style={{ color }}>
      {!!badge && (
        <div className={styles.badge}>
          <span>{badge}</span>
        </div>
      )}
      <div className={styles.content}>{text}</div>
    </div>
  );
}
