import { useEffect } from 'react';
import AvoidOffscreen from '../AvoidOffscreen';
import OptionList from '../OptionList';
import OptionListItem, {
  OptionListItemProps,
} from '../OptionList/OptionListItem';
import DropContainer from '../DropContainer';

export interface ContextMenuItemProps extends OptionListItemProps {
  children?: ContextMenuItemProps[];
}

interface ContextMenuProps {
  items: ContextMenuItemProps[];
  x: number;
  y: number;
  open?: boolean;
  minWidth?: number;
  onClose?: () => void;
}

function renderArrayOfMenu(
  items: ContextMenuItemProps[],
  onClose?: () => void,
  minWidth?: number
) {
  return (
    <DropContainer>
      <OptionList minWidth={minWidth}>
        {items.map((value, idx) => {
          const { children, onClick, ...props } = value;

          const overrideOnClick = (e: React.MouseEvent) => {
            if (onClick) onClick(e);
            if (onClose) onClose();
          };

          if (children && children.length > 0) {
            return (
              <OptionListItem {...props} key={idx} onClick={overrideOnClick}>
                {renderArrayOfMenu(children, onClose)}
              </OptionListItem>
            );
          }
          return (
            <OptionListItem key={idx} {...props} onClick={overrideOnClick} />
          );
        })}
      </OptionList>
    </DropContainer>
  );
}

export default function ContextMenu({
  items,
  x,
  y,
  onClose,
  open,
  minWidth,
}: ContextMenuProps) {
  useEffect(() => {
    const onDocumentClicked = () => {
      if (onClose) onClose();
    };

    document.addEventListener('mousedown', onDocumentClicked);
    return () => {
      document.removeEventListener('mousedown', onDocumentClicked);
    };
  }, [onClose]);

  console.log(items);

  return open ? (
    <div
      style={{ position: 'fixed', zIndex: 90000, left: x, top: y }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <AvoidOffscreen>
        {renderArrayOfMenu(items, onClose, minWidth)}
      </AvoidOffscreen>
    </div>
  ) : null;
}
