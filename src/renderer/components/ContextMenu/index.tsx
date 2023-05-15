import {
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import styles from './styles.module.scss';

interface ContextMenuItemProps {
  text: string;
  icon?: ReactNode;
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

export function useContextMenu() {
  const [status, setStatus] = useState({ x: 0, y: 0, open: false });

  const handleClose = useCallback(() => {
    setStatus((prev) => ({ ...prev, open: false }));
  }, [setStatus]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      setStatus((prev) => ({
        ...prev,
        open: true,
        x: e.clientX,
        y: e.clientY,
      }));
    },
    [setStatus]
  );

  return { contextStatus: status, handleClose, handleContextMenu };
}

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
      <span>{text}</span>
      <span className={styles.hotkey}></span>
    </li>
  );
};
