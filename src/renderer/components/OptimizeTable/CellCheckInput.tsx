import styles from './cells.module.scss';

export default function CellCheckInput() {
  return (
    <div className={styles.checkContainer}>
      <input type="checkbox" checked />
    </div>
  );
}
