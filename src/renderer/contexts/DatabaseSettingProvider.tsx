import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import { PropsWithChildren, createContext, useContext } from 'react';

const DatabaseSettingContext = createContext<{
  setting?: ConnectionStoreItem;
}>({});

export function useDatabaseSetting() {
  return useContext(DatabaseSettingContext);
}

export function DatabaseSettingProvider({
  children,
  setting,
}: PropsWithChildren<{ setting: ConnectionStoreItem }>) {
  return (
    <DatabaseSettingContext.Provider
      value={{
        setting,
      }}
    >
      {children}
    </DatabaseSettingContext.Provider>
  );
}
