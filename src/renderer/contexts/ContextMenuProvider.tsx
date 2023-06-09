import {
  useState,
  PropsWithChildren,
  createContext,
  useContext,
  useCallback,
} from 'react';
import ContextMenu, {
  ContextMenuItemProps,
} from 'renderer/components/ContextMenu';

const ContextMenuContext = createContext<{
  handleContextMenu: (e: React.MouseEvent) => void;
  handleClick: (e: React.MouseEvent) => void;
  setMenuItem: (items: ContextMenuItemProps[]) => void;
  open: boolean;
}>({
  handleContextMenu: () => {
    throw 'Not implemented';
  },
  handleClick: () => {
    throw 'Not implemented';
  },
  setMenuItem: () => {
    throw 'Not implemented';
  },
  open: false,
});

export function useContextMenu(
  cb: () => ContextMenuItemProps[],
  deps: unknown[]
) {
  const context = useContext(ContextMenuContext);
  const createMenuCallback = useCallback(cb, deps);
  const { open, setMenuItem, handleContextMenu, handleClick } = context;

  const handleContextMenuWithFreshData = useCallback(
    (e: React.MouseEvent) => {
      if (!open) {
        setMenuItem(createMenuCallback());
        handleContextMenu(e);
      }
    },
    [createMenuCallback, setMenuItem, open, handleContextMenu]
  );

  const handleClickWithFreshData = useCallback(
    (e: React.MouseEvent) => {
      if (!open) {
        setMenuItem(createMenuCallback());
        handleClick(e);
      }
    },
    [createMenuCallback, setMenuItem, open, handleClick]
  );

  return {
    handleContextMenu: handleContextMenuWithFreshData,
    handleClick: handleClickWithFreshData,
  };
}

export function ContextMenuProvider({ children }: PropsWithChildren) {
  const [menuItem, setMenuItem] = useState<ContextMenuItemProps[]>([]);
  const [status, setStatus] = useState({ x: 0, y: 0, open: false });

  const onClose = useCallback(() => {
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

      e.preventDefault();
    },
    [setStatus]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const bound = e.currentTarget.getBoundingClientRect();

      console.log('click', bound);

      setStatus((prev) => ({
        ...prev,
        open: true,
        x: bound.left,
        y: bound.bottom,
      }));

      e.preventDefault();
    },
    [setStatus]
  );

  return (
    <ContextMenuContext.Provider
      value={{ handleContextMenu, setMenuItem, open: status.open, handleClick }}
    >
      {children}
      <ContextMenu status={status} onClose={onClose}>
        {menuItem.map((itemProps, idx) => {
          return <ContextMenu.Item {...itemProps} key={idx} />;
        })}
      </ContextMenu>
    </ContextMenuContext.Provider>
  );
}
