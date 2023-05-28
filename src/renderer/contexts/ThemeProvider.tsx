import {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
  useContext,
} from 'react';

const ThemeContext = createContext<{
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}>({
  theme: 'light',
  setTheme: () => {
    throw 'Not implemented';
  },
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({
  children,
  defaultTheme,
}: PropsWithChildren<{ defaultTheme?: 'dark' | 'light' }>) {
  const [theme, setTheme] = useState<'dark' | 'light'>(defaultTheme || 'light');

  useEffect(() => {
    if (theme === 'light') {
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('dark');
    } else {
      const body = document.getElementsByTagName('body')[0];
      body.classList.add('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
