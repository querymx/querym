import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles.module.scss';
import Icon from '../Icon';

interface OverlayProps {
  open?: boolean;
  onClose?: () => void;
}

export default function OverlayScreen({
  children,
  open,
  onClose,
}: PropsWithChildren<OverlayProps>) {
  return open
    ? createPortal(
        <div className={styles.overlay}>
          <div className={styles.overlayBody}>{children}</div>
          <div className={styles.overlayHeader}>
            <div className={styles.overlayClose} onClick={onClose}>
              <Icon.Close />
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;
}
