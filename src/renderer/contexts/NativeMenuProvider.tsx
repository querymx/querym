import { PropsWithChildren } from 'react';
import useNativeMenu from 'renderer/hooks/useNativeMenu';
import { useTheme } from './ThemeProvider';

export default function NativeMenuProvider({ children }: PropsWithChildren) {
  const { theme, setTheme } = useTheme();

  useNativeMenu(
    () => [
      {
        label: 'File',
        submenu: [
          {
            label: 'Exit',
            role: 'close',
          },
        ],
      },
      {
        label: 'Preference',
        submenu: [
          {
            label: 'Dark Mode',
            type: 'checkbox',
            checked: theme === 'dark',
            id: 'dark-mode',
            click: () => {
              setTheme('dark');
            },
          },
          {
            label: 'Light Mode',
            type: 'checkbox',
            checked: theme === 'light',
            id: 'light-mode',
            click: () => {
              setTheme('light');
            },
          },
        ],
      },
    ],
    [theme, setTheme]
  );

  return <>{children}</>;
}
