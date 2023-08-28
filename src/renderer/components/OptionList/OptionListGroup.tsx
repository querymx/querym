import { PropsWithChildren } from 'react';
import styles from './styles.module.scss';

export default function OptionListGroup({
  children,
  text,
}: PropsWithChildren<{ text: string }>) {
  return (
    <div>
      <div className={styles.groupLabel}>{text}</div>
      <div>{children}</div>
    </div>
  );
}
