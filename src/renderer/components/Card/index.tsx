import { PropsWithChildren } from 'react';
import styles from './index.module.scss';

interface CardProps {
  onClick?: () => void;
  inline?: boolean;
  hover?: boolean;
}

export default function Card({
  children,
  inline,
  hover,
  onClick,
}: PropsWithChildren<CardProps>) {
  const className = [
    styles.card_wrap,
    hover ? styles.card_wrap_hover : undefined,
    inline ? styles.card_wrap_inline : undefined,
    onClick ? styles.card_wrap_clickable : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} onClick={onClick}>
      <div className={styles.card}>{children}</div>
    </div>
  );
}
