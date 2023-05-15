import { MySqlConnectionConfig } from 'drivers/SQLLikeConnection';
import MySQLCommonInterface from 'drivers/common/MySQLCommonInterface';
import NotImplementCommonInterface from 'drivers/common/NotImplementCommonInterface';
import SQLCommonInterface from 'drivers/common/SQLCommonInterface';
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useDatabaseSetting } from './DatabaseSettingProvider';
import { SqlRunnerManager } from 'libs/SqlRunnerManager';

const SqlExecuteContext = createContext<{
  runner: SqlRunnerManager;
  common: SQLCommonInterface;
}>({
  runner: new SqlRunnerManager(() => {
    throw 'Not implemented';
  }),
  common: new NotImplementCommonInterface(),
});

export function useSqlExecute() {
  return useContext(SqlExecuteContext);
}

export function SqlExecuteProvider({ children }: PropsWithChildren) {
  const { setting } = useDatabaseSetting();
  const runner = useMemo(() => {
    return new SqlRunnerManager(window.electron.query);
  }, []);

  const common = useMemo(
    () =>
      new MySQLCommonInterface(
        runner,
        (setting?.config as MySqlConnectionConfig)?.database
      ),
    [runner, setting]
  );

  return (
    <SqlExecuteContext.Provider value={{ runner, common }}>
      {children}
    </SqlExecuteContext.Provider>
  );
}
