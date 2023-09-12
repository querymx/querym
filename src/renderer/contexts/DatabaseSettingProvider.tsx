import { ConnectionStoreItem } from 'drivers/base/SQLLikeConnection';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { db } from 'renderer/db';

const DatabaseSettingContext = createContext<{
  setting?: ConnectionStoreItem;
  protectionLevel: number;
  setProductionLevel: (level: number) => void;
}>({
  protectionLevel: 1,
  setProductionLevel: () => {
    throw 'Not implemented';
  },
});

export function useDatabaseSetting() {
  return useContext(DatabaseSettingContext);
}

export function DatabaseSettingProvider({
  children,
  setting,
}: PropsWithChildren<{ setting: ConnectionStoreItem }>) {
  const [protectionLevel, setProductionLevel] = useState(
    setting.protectionLevel === undefined ? 1 : setting.protectionLevel
  );

  const setProductionLevelCallback = useCallback(
    (level: number) => {
      setProductionLevel(level);
      db.table('database_config').put({ ...setting, protectionLevel: level });
    },
    [setProductionLevel]
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
