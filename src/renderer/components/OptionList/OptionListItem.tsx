import { PropsWithChildren, ReactElement } from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import AvoidOffscreen from '../AvoidOffscreen';

interface OptionListItemProps {
  label: string;
  icon?: ReactElement;
  selected?: boolean;
  right?: string;
  labelWidth?: number;
  disabled?: boolean;
  destructive: boolean;
  separator: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function OptionListItem({
  label,
  icon,
  right,
  labelWidth,
  children,
  onClick,
}: PropsWithChildren<OptionListItemProps>) {
  return (
    <div className={styles.outerItem} onClick={onClick}>
      <div className={styles.item}>
        <div className={styles.icon}>{icon}</div>
        <div className={styles.label} style={{ width: labelWidth }}>
          {label}
        </div>
        <div className={styles.right}>{right}</div>
        <div className={styles.arrow}>
          {children && <FontAwesomeIcon icon={faChevronRight} />}
        </div>
      </div>

      {children && (
        <div className={styles.child}>
          <AvoidOffscreen>{children}</AvoidOffscreen>
        </div>
      )}
    </div>
  );
}
