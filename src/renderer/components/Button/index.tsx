import { ReactElement, useMemo } from 'react';
import styles from './styles.module.scss';

interface ButtonProps {
  children: string;
  plain?: boolean;
  primary?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: ReactElement;
  full?: boolean;
}

export default function Button({
  children,
  plain,
  primary,
  destructive,
  disabled,
  onClick,
  icon,
  full,
}: ButtonProps) {
  const className = useMemo(() => {
    return [
      styles.button,
      plain ? styles.plain : undefined,
      primary ? styles.primary : undefined,
      destructive ? styles.destructive : undefined,
      disabled ? styles.disabled : undefined,
      full ? styles.full : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  }, [plain, primary, destructive, disabled]);

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <span>{children}</span>
    </button>
  );
}
