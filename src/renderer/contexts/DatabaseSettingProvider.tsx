import { ConnectionStoreItem } from 'drivers/base/SQLLikeConnection';
import NotImplementCallback from 'libs/NotImplementCallback';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

const DatabaseSettingContext = createContext<{
  setting?: ConnectionStoreItem;
  protectionLevel: number;
  setProductionLevel: (level: number) => void;
}>({
  protectionLevel: 1,
  setProductionLevel: NotImplementCallback,
});

export function useDatabaseSetting() {
  return useContext(DatabaseSettingContext);
}

export function DatabaseSettingProvider({
  children,
  setting,
}: PropsWithChildren<{ setting: ConnectionStoreItem }>) {
  const [protectionLevel, setProductionLevel] = useState(
    setting.protectionLevel === undefined ? 1 : setting.protectionLevel,
  );

  const setProductionLevelCallback = useCallback(
    (level: number) => {
      setProductionLevel(level);
    },
    [setProductionLevel],
  );

  return (
    <DatabaseSettingContext.Provider
      value={{
        setting,
        protectionLevel,
        setProductionLevel: setProductionLevelCallback,
      }}
    >
      {children}
    </DatabaseSettingContext.Provider>
  );
}
