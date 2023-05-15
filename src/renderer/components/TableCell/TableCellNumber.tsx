import styles from './styles.module.css';

interface TableCellNumberProps {
  value: number;
}

export default function TableCellNumber({ value }: TableCellNumberProps) {
  return <div className={`${styles.container} ${styles.number}`}>{value}</div>;
}
