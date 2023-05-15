import styles from './empty.module.css';

interface ListViewEmptyStateProps {
  text: string;
}

export default function ListViewEmptyState({ text }: ListViewEmptyStateProps) {
  return <div className={styles.empty}>{text}</div>;
}
