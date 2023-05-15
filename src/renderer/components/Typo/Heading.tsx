import { PropsWithChildren, memo } from 'react';
import styles from './typo.module.css';

export default memo(function Heading({ children }: PropsWithChildren) {
  return <h1 className={styles.heading}>{children}</h1>;
});
