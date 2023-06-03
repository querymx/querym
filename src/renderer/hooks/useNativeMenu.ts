import { useMemo, useEffect } from 'react';
import { MenuItemConstructorOptions } from 'electron';

function collectEvents(
  menu: MenuItemConstructorOptions[],
  events: Record<string, () => void>
): MenuItemConstructorOptions[] {
  return menu.map((item) => {
    const { click, submenu, ...other } = item;

    if (item.id && click) {
      events[item.id] = click as () => void;
    }

    return {
      submenu: submenu
        ? collectEvents(submenu as MenuItemConstructorOptions[], events)
        : undefined,
      ...other,
    };
  });
}

export default function useNativeMenu(
  cb: () => MenuItemConstructorOptions[],
  deps: unknown[]
) {
  const menuItems = useMemo(cb, deps);

  useEffect(() => {
    const events: Record<string, () => void> = {};
    const menuWithoutEvent = collectEvents(menuItems, events);

    window.electron.handleMenuClick((_, id) => {
      if (events[id]) {
        events[id]();
      }
    });

    window.electron.setNativeMenu(menuWithoutEvent);
  }, [menuItems]);
}
