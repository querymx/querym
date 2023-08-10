import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles.module.scss';
import Icon from '../Icon';

interface ModalProps {
  title: string;
  open?: boolean;
  onClose?: () => void;
  wide?: boolean;
  maxWidth?: number;
}

export default function Modal({
  children,
  title,
  open,
  onClose,
  wide,
  maxWidth,
}: PropsWithChildren<ModalProps>) {
  return open
    ? createPortal(
        <>
          <div className={styles.blur} onClick={onClose} />
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles.modal}
              style={{ width: wide ? '80%' : undefined, maxWidth }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>{title}</div>
                <div className={styles.modalClose} onClick={onClose}>
                  <Icon.Close />
                </div>
              </div>
              <div>{children}</div>
            </div>
          </div>
        </>,
        document.body
      )
    : null;
}

Modal.Body = ({
  children,
  noPadding,
}: PropsWithChildren<{ noPadding?: boolean }>) => {
  return (
    <div
      style={{ padding: noPadding ? 0 : undefined }}
      className={styles.modalBody}
    >
      {children}
    </div>
  );
};

Modal.Footer = ({ children }: PropsWithChildren) => {
  return <div className={styles.modalFooter}>{children}</div>;
};
