import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './styles.module.scss';
import Icon from '../Icon';
import { useAppFeature } from 'renderer/contexts/AppFeatureProvider';

interface ListViewItemProps {
  text: string;
  subtitle?: string;
  draggable?: boolean;
  highlight?: string;
  icon?: ReactElement;
  changed?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (
    e: React.DragEvent<HTMLDivElement>,
    position: 'top' | 'bottom',
  ) => void;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;

  renaming?: boolean;
  onRenamed?: (newName: string | null) => void;

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
  subtitle,
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
  renaming,
  onRenamed,

  // For TreeView
  depth,
  hasCollapsed,
  collapsed,
  onCollapsedClick,
}: ListViewItemProps) {
  const { theme } = useAppFeature();
  const [renameDraftValue, setRenameDraftValue] = useState('');
  const [dropSide, setDropSide] = useState<'none' | 'top' | 'bottom'>('none');
  const large = !!subtitle;
  const ref = useRef(null);

  useEffect(() => {
    setRenameDraftValue(text);
  }, [renaming, text, setRenameDraftValue]);

  const onRenameDone = useCallback(
    (value: string | null) => {
      if (onRenamed) onRenamed(value);
    },
    [onRenamed],
  );

  const finalText = useMemo(() => {
    if (highlight) {
      const highlightText = encodeStringToHTML(highlight);
      const santizedText = encodeStringToHTML(text || '');
      const regex = new RegExp(
        '(' + highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')',
        'i',
      );

      return santizedText.replace(
        regex,
        `<mark style="padding: 0; background-color: #047bf8; color: white">$1</mark>`,
      );
    } else {
      return encodeStringToHTML(text || '');
    }
  }, [text, highlight]);

  return (
    <div
      ref={ref}
      className={[
        styles.item,
        selected ? styles.selected : styles.hover,
        changed ? styles.changed : undefined,
        large ? styles.large : undefined,
        dropSide === 'bottom' ? styles.dropBottom : undefined,
        dropSide === 'top' ? styles.dropTop : undefined,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable={draggable}
      onDragOver={(e) => {
        if (onDragOver) onDragOver(e);
        const side = e.nativeEvent.offsetY > 10 ? 'bottom' : 'top';
        if (dropSide !== side) setDropSide(side);
      }}
      onDragLeave={() => {
        if (dropSide !== 'none') setDropSide('none');
      }}
      onDragStart={onDragStart}
      onDrop={(e) => {
        const side = e.nativeEvent.offsetY > 10 ? 'bottom' : 'top';
        if (onDrop) onDrop(e, side);
        setDropSide('none');
      }}
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
              theme === 'dark'
                ? `${styles.action} ${styles.dark}`
                : styles.action
            }
            onClick={onCollapsedClick}
          >
            <Icon.Down />
          </div>
        ) : (
          <div
            className={
              theme === 'dark'
                ? `${styles.action} ${styles.dark}`
                : styles.action
            }
            onClick={onCollapsedClick}
          >
            <Icon.Right />
          </div>
        ))}
      {icon && <div className={styles.icon}>{icon}</div>}
      <div>
        {renaming ? (
          <div className={styles.text}>
            <input
              autoFocus
              onBlur={() => {
                onRenameDone(renameDraftValue);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRenameDone(renameDraftValue);
                } else if (e.key === 'Escape') {
                  onRenameDone(null);
                }
              }}
              type="text"
              value={renameDraftValue}
              onChange={(e) => setRenameDraftValue(e.currentTarget.value)}
            />
          </div>
        ) : (
          <div
            className={styles.text}
            dangerouslySetInnerHTML={{ __html: finalText }}
          />
        )}
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}
