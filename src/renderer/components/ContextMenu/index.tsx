import {
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import styles from './styles.module.scss';

export interface ContextMenuItemProps {
  text: string;
  icon?: ReactNode;
  hotkey?: string;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
  separator?: boolean;
}

interface ContextMenuStatus {
  x: number;
  y: number;
  open: boolean;
}

const ContextMenuContext = createContext<{ handleClose: () => void }>({
  handleClose: () => {
    return;
  },
});

export default function ContextMenu({
  children,
  status,
  onClose,
}: PropsWithChildren<{
  status: ContextMenuStatus;
  onClose: () => void;
}>) {
  useEffect(() => {
    const onDocumentClicked = () => {
      onClose();
    };

    document.addEventListener('mousedown', onDocumentClicked);
    return () => {
      document.removeEventListener('mousedown', onDocumentClicked);
    };
  }, [onClose]);

  return (
    <ContextMenuContext.Provider value={{ handleClose: onClose }}>
      <div
        className={styles.contextMenu}
        style={{
          visibility: status.open ? 'visible' : 'hidden',
          top: status.y,
          left: status.x,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ul>{children}</ul>
      </div>
    </ContextMenuContext.Provider>
  );
}

ContextMenu.Item = function ({
  text,
  onClick,
  icon,
  disabled,
  destructive,
  separator,
  hotkey,
}: ContextMenuItemProps) {
  const { handleClose } = useContext(ContextMenuContext);

  const onMenuClicked = useCallback(() => {
    if (onClick) {
      onClick();
    }
    handleClose();
  }, [handleClose, onClick]);

  return (
    <li
      onClick={!disabled ? onMenuClicked : undefined}
      className={[
        disabled ? styles.disabled : undefined,
        separator ? styles.separator : undefined,
        !disabled && destructive ? styles.destructive : undefined,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>{text}</span>
      <span className={styles.hotkey}>{hotkey}</span>
    </li>
  );
};
