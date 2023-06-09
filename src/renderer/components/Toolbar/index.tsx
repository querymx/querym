import { PropsWithChildren, ReactNode } from 'react';
import styles from './styles.module.scss';
import { ContextMenuItemProps } from '../ContextMenu';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';

interface ToolbarItemProps {
  icon?: ReactNode;
  text: string;
  onClick?: () => void;
}

export default function Toolbar({
  children,
  shadow,
}: PropsWithChildren<{ shadow?: boolean }>) {
  return (
    <div
      className={shadow ? `${styles.toolbar} ${styles.shadow}` : styles.toolbar}
    >
      <ul>{children}</ul>
    </div>
  );
}

Toolbar.Item = function ({ icon, text, onClick }: ToolbarItemProps) {
  return (
    <li onClick={onClick}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{text}</span>
    </li>
  );
};

Toolbar.ContextMenu = function ({
  items,
  icon,
  text,
}: {
  items: ContextMenuItemProps[];
  text: string;
  icon?: ReactNode;
}) {
  const { handleClick } = useContextMenu(() => items, [items]);

  return (
    <li onClick={handleClick}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{text}</span>
    </li>
  );
};
