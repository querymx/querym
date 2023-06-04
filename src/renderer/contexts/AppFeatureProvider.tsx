import {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import { useAppConfig } from './AppConfigProvider';

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
  const { config, saveConfig } = useAppConfig();
  const [theme, setTheme] = useState<'dark' | 'light'>(
    config?.theme || defaultTheme || 'light'
  );
  const [enableDebug, setEnableDebug] = useState(config.debug || false);

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
    (value: 'dark' | 'light') => {
      saveConfig({
        theme: value,
      });
      setTheme(value);
    },
    [saveConfig, setTheme]
  );

  const setEnableDebugCallback = useCallback(
    (value: boolean) => {
      saveConfig({
        debug: value,
      });
      setEnableDebug(value);
    },
    [saveConfig, setEnableDebug]
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
    </AppFeatureContext.Provider>
  );
}
