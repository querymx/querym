import { PropsWithChildren } from 'react';
import styles from './styles.modules.scss';

export default function Table({ children }: PropsWithChildren) {
  return <table className={styles.table}>{children}</table>;
}
