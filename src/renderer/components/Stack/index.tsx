import { PropsWithChildren, memo } from 'react';
import styles from './styles.module.scss';

interface StackProps {
  vertical?: boolean;
  center?: boolean;
  full?: boolean;
  padding?: boolean;
  spacing?: 'none' | 'sm' | 'md';
}

export default memo(function Stack({
  vertical,
  center,
  full,
  padding,
  spacing,
  children,
}: PropsWithChildren<StackProps>) {
  const className = [
    styles.stack,
    center ? styles.center : undefined,
    vertical ? styles.vertical : undefined,
    full ? styles.full : undefined,
    padding ? styles.padding : undefined,
    spacing === 'none'
      ? styles.spaceNone
      : spacing === 'sm'
      ? styles.spaceSmall
      : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={className}>{children}</div>;
});
