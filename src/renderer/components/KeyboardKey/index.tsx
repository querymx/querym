import styles from './styles.module.scss';

export default function KeyboardKey({ name }: { name: string }) {
  return <div className={styles.key}>{name}</div>;
}
