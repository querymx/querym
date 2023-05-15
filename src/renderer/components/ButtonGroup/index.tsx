import { PropsWithChildren } from 'react';
import styles from './styles.module.scss';

export default function ButtonGroup({ children }: PropsWithChildren<unknown>) {
  return <div className={styles.buttonGroup}>{children}</div>;
}
