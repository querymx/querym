import styles from './styles.module.css';

interface TableCellJsonProps {
  value: unknown;
}

export default function TableCellJson({ value }: TableCellJsonProps) {
  return (
    <div className={styles.typedContainer}>
      <div>
        <div className={styles.badge}>json</div>
      </div>
      <div className={styles.code}>
        {value ? JSON.stringify(value) : 'NULL'}
      </div>
    </div>
  );
}
