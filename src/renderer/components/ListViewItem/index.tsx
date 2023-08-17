import { ReactElement, useMemo } from 'react';
import styles from './styles.module.scss';
import Icon from '../Icon';
import { useAppFeature } from 'renderer/contexts/AppFeatureProvider';

interface ListViewItemProps {
  text: string;
  draggable?: boolean;
  highlight?: string;
  icon?: ReactElement;
  changed?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;

  // This is used for rendering TreeView
  depth?: number;
  hasCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedClick?: () => void;
}

function encodeStringToHTML(s: string) {
  const el = document.createElement('div');
  el.innerText = el.textContent = s;
  s = el.innerHTML;
  return s;
}

export default function ListViewItem({
  text,
  highlight,
  icon,
  selected,
  changed,
  onClick,
  onDoubleClick,
  onContextMenu,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,

  // For TreeView
  depth,
  hasCollapsed,
  collapsed,
  onCollapsedClick,
}: ListViewItemProps) {
  const { theme } = useAppFeature();

  const finalText = useMemo(() => {
    if (highlight) {
      const highlightText = encodeStringToHTML(highlight);
      const santizedText = encodeStringToHTML(text || '');
      const regex = new RegExp(
        '(' + highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')',
        'i'
      );

      return santizedText.replace(
        regex,
        `<mark style="padding: 0; background-color: #047bf8; color: white">$1</mark>`
      );
    } else {
      return encodeStringToHTML(text || '');
    }
  }, [text, highlight]);

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
      draggable={draggable}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
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
      <div
        className={styles.text}
        dangerouslySetInnerHTML={{ __html: finalText }}
      />
    </div>
  );
}
