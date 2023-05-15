import { PropsWithChildren, memo } from 'react';
import styles from './styles.module.css';

interface BoxProps {
  padding?: boolean;
  full?: boolean;
  center?: boolean;
}

export default memo(function Box({
  children,
  padding,
  full,
  center,
}: PropsWithChildren<BoxProps>) {
  const className = [
    styles.box,
    full ? styles.full : undefined,
    center ? styles.center : undefined,
    padding ? styles.padding : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={className}>{children}</div>;
});
