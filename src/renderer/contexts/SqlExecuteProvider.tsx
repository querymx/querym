import { MySqlConnectionConfig } from 'drivers/base/SQLLikeConnection';
import MySQLCommonInterface from 'drivers/mysql/MySQLCommonInterface';
import NotImplementCommonInterface from 'drivers/base/NotImplementCommonInterface';
import SQLCommonInterface from 'drivers/base/SQLCommonInterface';
import { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useDatabaseSetting } from './DatabaseSettingProvider';
import { SqlRunnerManager } from 'libs/SqlRunnerManager';
import NotImplementCallback from 'libs/NotImplementCallback';
import PgCommonInterface from 'drivers/pg/PgCommonInterface';

const SqlExecuteContext = createContext<{
  runner: SqlRunnerManager;
  common: SQLCommonInterface;
}>({
  runner: new SqlRunnerManager(NotImplementCallback),
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

  const common = useMemo(() => {
    if (setting?.type === 'mysql') {
      return new MySQLCommonInterface(
        runner,
        (setting?.config as MySqlConnectionConfig)?.database
          ? (setting?.config as MySqlConnectionConfig)?.database
          : undefined
      );
    } else {
      return new PgCommonInterface(
        runner,
        (setting?.config as MySqlConnectionConfig)?.database
          ? (setting?.config as MySqlConnectionConfig)?.database
          : undefined
      );
    }
  }, [runner, setting]);

  return (
    <SqlExecuteContext.Provider value={{ runner, common }}>
      {children}
    </SqlExecuteContext.Provider>
  );
}
