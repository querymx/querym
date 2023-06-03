import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ConfigurationFileFormat } from 'types/FileFormatType';

const AppConfigContext = createContext<{
  config: ConfigurationFileFormat;
  saveConfig: (value: Partial<ConfigurationFileFormat>) => void;
}>({
  config: {} as ConfigurationFileFormat,
  saveConfig: () => {
    throw 'Not implemented';
  },
});

export function useAppConfig() {
  return useContext(AppConfigContext);
}

export function AppConfigProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<ConfigurationFileFormat>();

  useEffect(() => {
    window.electron.loadConnectionConfig().then(setConfig);
  }, [setConfig]);

  const saveConfig = useCallback(
    (value: Partial<ConfigurationFileFormat>) => {
      setConfig((prev) => {
        if (prev) {
          const finalValue = { ...prev, ...value };
          window.electron.saveConnectionConfig(finalValue).then();
          return finalValue;
        }
        return prev;
      });
    },
    [setConfig]
  );

  if (!config) {
    return <div />;
  }

  return (
    <AppConfigContext.Provider value={{ config, saveConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}
