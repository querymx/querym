import { ReactElement } from 'react';
import styles from './styles.module.scss';
import Icon from '../Icon';
import { useTheme } from 'renderer/contexts/ThemeProvider';

interface ListViewItemProps {
  text: string;
  icon?: ReactElement;
  changed?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;

  // This is used for rendering TreeView
  depth?: number;
  hasCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedClick?: () => void;
}

export default function ListViewItem({
  text,
  icon,
  selected,
  changed,
  onClick,
  onDoubleClick,
  onContextMenu,

  // For TreeView
  depth,
  hasCollapsed,
  collapsed,
  onCollapsedClick,
}: ListViewItemProps) {
  const { theme } = useTheme();

  return (
    <div
      className={[
        styles.item,
        selected ? styles.selected : styles.hover,
        changed ? styles.changed : undefined,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {!!depth &&
        new Array(depth)
          .fill(true)
          .map((_, depthIndex) => (
            <div key={depthIndex} className={styles.depth} />
          ))}
      {hasCollapsed &&
        (collapsed ? (
          <div
            className={
              theme === 'dark' ? `${styles.icon} ${styles.dark}` : styles.icon
            }
            onClick={onCollapsedClick}
          >
            <Icon.Down />
          </div>
        ) : (
          <div
            className={
              theme === 'dark' ? `${styles.icon} ${styles.dark}` : styles.icon
            }
            onClick={onCollapsedClick}
          >
            <Icon.Right />
          </div>
        ))}
      {!hasCollapsed && <div className={styles.icon}>{icon}</div>}
      <div className={styles.text}>{text}</div>
    </div>
  );
}
