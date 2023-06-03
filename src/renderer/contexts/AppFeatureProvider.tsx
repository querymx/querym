import {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
  useContext,
} from 'react';

const AppFeatureContext = createContext<{
  theme: 'dark' | 'light';
  enableDebug: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  setEnableDebug: (value: boolean) => void;
}>({
  theme: 'light',
  enableDebug: false,

  setTheme: () => {
    throw 'Not implemented';
  },
  setEnableDebug: () => {
    throw 'Not implemented';
  },
});

export function useAppFeature() {
  return useContext(AppFeatureContext);
}

export default function AppFeatureProvider({
  children,
  defaultTheme,
}: PropsWithChildren<{ defaultTheme?: 'dark' | 'light' }>) {
  const [theme, setTheme] = useState<'dark' | 'light'>(defaultTheme || 'light');
  const [enableDebug, setEnableDebug] = useState(false);

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
    <AppFeatureContext.Provider
      value={{ theme, enableDebug, setTheme, setEnableDebug }}
    >
      {children}
    </AppFeatureContext.Provider>
  );
}
