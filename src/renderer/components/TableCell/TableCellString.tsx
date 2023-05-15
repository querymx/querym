import styles from './styles.module.css';

interface TableCellStringProps {
  text: string;
}

export default function TableCellString({ text }: TableCellStringProps) {
  return <div className={styles.container}>{text?.toString()}</div>;
}
