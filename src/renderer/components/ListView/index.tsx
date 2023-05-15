import { ReactElement, useCallback } from 'react';
import ListViewItem from '../ListViewItem';

interface ListViewProps<T> {
  items: T[];
  selectedItem?: T;
  changeItemKeys?: string[];
  emptyComponent?: ReactElement;
  extractMeta: (item: T) => { icon?: ReactElement; text: string; key: string };

  onSelectChange?: (item?: T) => void;
  onBeforeSelectChange?: () => Promise<boolean>;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: (item: T) => void;
}

export default function ListView<T>({
  items,
  selectedItem,
  changeItemKeys,
  extractMeta,
  emptyComponent,
  onSelectChange,
  onBeforeSelectChange,
  onContextMenu,
  onDoubleClick,
}: ListViewProps<T>) {
  const selectedKey = selectedItem ? extractMeta(selectedItem).key : undefined;

  const onItemChanged = useCallback(
    async (item?: T) => {
      if (onBeforeSelectChange) {
        if (await onBeforeSelectChange()) {
          if (onSelectChange) onSelectChange(item);
        }
      } else {
        if (onSelectChange) onSelectChange(item);
      }
    },
    [onBeforeSelectChange, onSelectChange]
  );

  return (
    <div
      style={{ height: '100%' }}
      onContextMenu={(e) => {
        if (onContextMenu) {
          onContextMenu(e);
        }

        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {items.length === 0 && emptyComponent}
      {items.map((item) => {
        const { text, icon, key } = extractMeta(item);
        return (
          <ListViewItem
            key={key}
            text={text}
            icon={icon}
            selected={key === selectedKey}
            changed={changeItemKeys?.includes(key)}
            onContextMenu={async (e) => {
              if (key !== selectedKey) {
                await onItemChanged(item);
              }

              if (onContextMenu) {
                onContextMenu(e);
              }

              e.preventDefault();
              e.stopPropagation();
            }}
            onDoubleClick={() => {
              if (onDoubleClick) {
                onDoubleClick(item);
              }
            }}
            onClick={async () => {
              await onItemChanged(item);
            }}
          />
        );
      })}
    </div>
  );
}
