import styles from './styles.module.scss';
import ListViewItem from '../ListViewItem';
import { ReactElement, useCallback } from 'react';

let GLOBAL_TREE_DRAG_ITEM: unknown;

export interface TreeViewItemData<T> {
  id: string;
  text?: string;
  subtitle?: string;
  icon?: ReactElement;
  data?: T;
  children?: TreeViewItemData<T>[];
}

interface TreeViewCommonProps<T> {
  draggable?: boolean;
  onDragItem?: (
    from: TreeViewItemData<T>,
    to: TreeViewItemData<T>,
    side: 'bottom' | 'top',
  ) => void;
  onCollapsedChange?: (value?: string[]) => void;
  onSelectChange?: (value?: TreeViewItemData<T>) => void;
  onDoubleClick?: (value: TreeViewItemData<T>) => void;
  selected?: TreeViewItemData<T>;
  collapsedKeys?: string[];
  highlight?: string;
  highlightDepth?: number;

  /**
   * When renameSelectedItem is true, it will render, the current
   * selected item as editable field.
   */
  renameSelectedItem?: boolean;

  /**
   * When Enter or Lost Focus, it will treat as successful rename
   * If user press escape, it will cancel the rename
   *
   * @param newName The new name that we just rename into.
   *                If it is null, it means we cancel the rename
   * @returns
   */
  onRenamedSelectedItem?: (newName: string | null) => void;
}

interface TreeViewProps<T> extends TreeViewCommonProps<T> {
  items: TreeViewItemData<T>[];
  onBeforeSelectChange?: () => Promise<boolean>;
  onContextMenu?: React.MouseEventHandler;
  emptyState?: ReactElement;
}

interface TreeViewItemProps<T> extends TreeViewCommonProps<T> {
  item: TreeViewItemData<T>;
  depth: number;
}

function TreeViewItem<T>(props: TreeViewItemProps<T>) {
  const { depth, item, ...common } = props;
  const {
    collapsedKeys,
    draggable,
    onDragItem,
    onDoubleClick,
    highlight,
    selected,
    onSelectChange,
    onCollapsedChange,
    highlightDepth,
    renameSelectedItem,
    onRenamedSelectedItem,
  } = props;

  const hasCollapsed = !!item.children;
  const isCollapsed = collapsedKeys?.includes(item.id);

  const onSelectChangeCallback = useCallback(() => {
    if (onSelectChange) {
      onSelectChange(item);
    }
  }, [onSelectChange, item]);

  const isSelected = selected?.id === item.id;

  return (
    <div>
      <ListViewItem
        draggable={draggable}
        onDragStart={() => {
          GLOBAL_TREE_DRAG_ITEM = item;
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(_, side) => {
          if (onDragItem) {
            if (GLOBAL_TREE_DRAG_ITEM) {
              onDragItem(
                GLOBAL_TREE_DRAG_ITEM as TreeViewItemData<T>,
                item,
                side,
              );
            }
          }
        }}
        key={item.id}
        text={item.text || ''}
        subtitle={item.subtitle}
        icon={item.icon}
        depth={depth}
        onDoubleClick={() => {
          if (onDoubleClick) {
            onDoubleClick(item);
          }
        }}
        highlight={depth === highlightDepth ? highlight : undefined}
        hasCollapsed={hasCollapsed}
        collapsed={isCollapsed}
        selected={isSelected}
        renaming={isSelected && renameSelectedItem}
        onRenamed={onRenamedSelectedItem}
        onClick={onSelectChangeCallback}
        onContextMenu={onSelectChangeCallback}
        onCollapsedClick={() => {
          if (onCollapsedChange) {
            if (isCollapsed) {
              onCollapsedChange(
                collapsedKeys?.filter(
                  (collapsedKey) => collapsedKey !== item.id,
                ),
              );
            } else {
              onCollapsedChange([...(collapsedKeys || []), item.id]);
            }
          }
        }}
      />
      {isCollapsed && (
        <div>
          {item.children?.map((item) => {
            return (
              <TreeViewItem
                {...common}
                key={item.id}
                item={item}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TreeView<T>(props: TreeViewProps<T>) {
  const {
    items,
    onSelectChange,
    onBeforeSelectChange,
    onContextMenu,
    emptyState,
    ...common
  } = props;

  const onSelectChangeWithHook = useCallback(
    (item: TreeViewItemData<T> | undefined) => {
      if (onSelectChange) {
        if (onBeforeSelectChange) {
          onBeforeSelectChange().then(() => onSelectChange(item));
        } else {
          onSelectChange(item);
        }
      }
    },
    [onSelectChange, onBeforeSelectChange],
  );

  return (
    <div className={`${styles.treeView} scroll`} onContextMenu={onContextMenu}>
      {items.length > 0
        ? items.map((item) => {
            return (
              <TreeViewItem
                {...common}
                onSelectChange={onSelectChangeWithHook}
                key={item.id}
                item={item}
                depth={0}
              />
            );
          })
        : emptyState}
    </div>
  );
}
