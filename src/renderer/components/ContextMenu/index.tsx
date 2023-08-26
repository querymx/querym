import {
  CSSProperties,
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import AvoidOffscreen from '../AvoidOffscreen';
import OptionList from '../OptionList';
import OptionListItem from '../OptionList/OptionListItem';
import DropContainer from '../DropContainer';

export interface ContextMenuItemProps {
  text: string;
  icon?: ReactElement;
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
  useEffect(() => {
    const onDocumentClicked = () => {
      onClose();
    };

    document.addEventListener('mousedown', onDocumentClicked);
    return () => {
      document.removeEventListener('mousedown', onDocumentClicked);
    };
  }, [onClose]);

  const menuStyle: CSSProperties = {
    minWidth,
    left: status.x,
    top: status.y,
  };

  return (
    <ContextMenuContext.Provider value={{ handleClose: onClose }}>
      {status.open && (
        <div
          className={styles.contextMenu}
          style={menuStyle}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <AvoidOffscreen>
            <DropContainer>
              <OptionList>{children}</OptionList>
            </DropContainer>
          </AvoidOffscreen>
        </div>
      )}
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
    <OptionListItem
      label={text}
      onClick={!disabled ? onMenuClicked : undefined}
      destructive={destructive}
      disabled={disabled}
      right={hotkey}
      icon={tick ? <FontAwesomeIcon icon={faCheck} /> : icon}
      labelWidth={300}
      separator={separator}
    />
    // <li
    //   onClick={!disabled ? onMenuClicked : undefined}
    //   className={[
    //     disabled ? styles.disabled : undefined,
    //     separator ? styles.separator : undefined,
    //     !disabled && destructive ? styles.destructive : undefined,
    //   ]
    //     .filter(Boolean)
    //     .join(' ')}
    // >
    //   <div className={styles.icon}>
    //     <span>{tick ? <FontAwesomeIcon icon={faCheck} /> : icon}</span>
    //   </div>
    //   <div className={styles.text}>
    //     <span>{text}</span>
    //   </div>
    //   <div className={styles.hotkey}>
    //     <span>{hotkey}</span>
    //   </div>
    // </li>
  );
};
