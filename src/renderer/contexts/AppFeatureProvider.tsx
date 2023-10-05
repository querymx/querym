import NotImplementCallback from 'libs/NotImplementCallback';
import { ToastContainer } from 'react-toastify';
import {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';

type ThemeOption = 'dark' | 'light';

const AppFeatureContext = createContext<{
  theme: 'dark' | 'light';
  enableDebug: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  setEnableDebug: (value: boolean) => void;
}>({
  theme: 'light',
  enableDebug: false,

  setTheme: NotImplementCallback,
  setEnableDebug: NotImplementCallback,
});

export function useAppFeature() {
  return useContext(AppFeatureContext);
}

export default function AppFeatureProvider({
  children,
  defaultTheme,
}: PropsWithChildren<{ defaultTheme?: ThemeOption }>) {
  const [theme, setTheme] = useState<ThemeOption>(
    (localStorage.getItem('theme') as ThemeOption) || defaultTheme || 'light',
  );
  const [enableDebug, setEnableDebug] = useState(
    localStorage.getItem('debug') === '1' || false,
  );

  useEffect(() => {
    if (theme === 'light') {
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('dark');
    } else {
      const body = document.getElementsByTagName('body')[0];
      body.classList.add('dark');
    }
  }, [theme]);

  const setThemeCallback = useCallback(
    (value: ThemeOption) => {
      localStorage.setItem('theme', value);
      setTheme(value);
    },
    [setTheme],
  );

  const setEnableDebugCallback = useCallback(
    (value: boolean) => {
      localStorage.setItem('debug', value ? '1' : '0');
      setEnableDebug(value);
    },
    [setEnableDebug],
  );

  return (
    <AppFeatureContext.Provider
      value={{
        theme,
        enableDebug,
        setTheme: setThemeCallback,
        setEnableDebug: setEnableDebugCallback,
      }}
    >
      {children}
      <ToastContainer theme={theme} />
    </AppFeatureContext.Provider>
  );
}
