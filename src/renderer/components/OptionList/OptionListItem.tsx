import { PropsWithChildren, ReactElement, useMemo } from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import AvoidOffscreen from '../AvoidOffscreen';

export interface OptionListItemProps {
  text: string;
  icon?: ReactElement;
  selected?: boolean;
  right?: string;
  labelWidth?: number;
  disabled?: boolean;
  tick?: boolean;
  destructive?: boolean;
  separator?: boolean;
  onClick?: (e: React.MouseEvent) => Promise<void> | void;
}

export default function OptionListItem({
  text,
  icon,
  right,
  tick,
  labelWidth,
  children,
  onClick,
  disabled,
  destructive,
  separator,
}: PropsWithChildren<OptionListItemProps>) {
  const className = useMemo(() => {
    return [
      styles.item,
      disabled ? styles.disabled : undefined,
      !disabled && destructive ? styles.destructive : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  }, [disabled, destructive, separator]);

  const outterClassName = useMemo(() => {
    return [styles.outerItem, separator ? styles.separator : undefined]
      .filter(Boolean)
      .join(' ');
  }, []);

  return (
    <div
      className={outterClassName}
      onClick={disabled || children ? undefined : onClick}
    >
      <div className={className}>
        <div className={styles.icon}>
          {tick ? <FontAwesomeIcon icon={faCheck} /> : icon}
        </div>
        <div className={styles.label} style={{ width: labelWidth }}>
          {text}
        </div>
        <div className={styles.right}>{right}</div>
        <div className={styles.arrow}>
          {children && !disabled && <FontAwesomeIcon icon={faChevronRight} />}
        </div>
      </div>

      {children && !disabled && (
        <div className={styles.child}>
          <AvoidOffscreen>{children}</AvoidOffscreen>
        </div>
      )}
    </div>
  );
}
