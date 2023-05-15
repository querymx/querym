import { PropsWithChildren } from 'react';
import styles from './styles.module.scss';
import Icon from '../Icon';

interface ModalProps {
  title: string;
  open?: boolean;
  onClose?: () => void;
}

export default function Modal({
  children,
  title,
  open,
  onClose,
}: PropsWithChildren<ModalProps>) {
  return open ? (
    <>
      <div className={styles.blur} onClick={onClose} />
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>{title}</div>
            <div className={styles.modalClose} onClick={onClose}>
              <Icon.Close />
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </>
  ) : null;
}

Modal.Body = ({ children }: PropsWithChildren) => {
  return <div className={styles.modalBody}>{children}</div>;
};

Modal.Footer = ({ children }: PropsWithChildren) => {
  return <div className={styles.modalFooter}>{children}</div>;
};
