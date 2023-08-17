import {
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export interface ContextMenuItemProps {
  text: string;
  icon?: ReactNode;
  hotkey?: string;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
  separator?: boolean;
  tick?: boolean;
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
  minWidth,
}: PropsWithChildren<{
  status: ContextMenuStatus;
  onClose: () => void;
  minWidth?: number;
}>) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuWidth, setMenuWidth] = useState(0);
  const [menuHeight, setMenuHeight] = useState(0);

  useEffect(() => {
    const onDocumentClicked = () => {
      onClose();
    };

    document.addEventListener('mousedown', onDocumentClicked);
    return () => {
      document.removeEventListener('mousedown', onDocumentClicked);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const { width, height } = menuRef.current.getBoundingClientRect();
      setMenuWidth(width);
      setMenuHeight(height);
    }
  }, [status.open]);

  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;

  const menuStyle: CSSProperties = {
    visibility: status.open ? 'visible' : 'hidden',
    top: Math.min(status.y, viewportHeight - menuHeight - 10),
    left: Math.min(status.x, viewportWidth - menuWidth - 10),
    minWidth,
  };

  return (
    <ContextMenuContext.Provider value={{ handleClose: onClose }}>
      <div
        ref={menuRef}
        className={styles.contextMenu}
        style={menuStyle}
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
  tick,
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
      <div className={styles.icon}>
        <span>{tick ? <FontAwesomeIcon icon={faCheck} /> : icon}</span>
      </div>
      <div className={styles.text}>
        <span>{text}</span>
      </div>
      <div className={styles.hotkey}>
        <span>{hotkey}</span>
      </div>
    </li>
  );
};
