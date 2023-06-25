import { BeforeEachEventCallback } from 'libs/SqlRunnerManager';
import { PropsWithChildren, useEffect } from 'react';
import { useSchmea } from './SchemaProvider';
import { useSqlExecute } from './SqlExecuteProvider';

export default function SwitchDatabaseProvider({
  children,
}: PropsWithChildren) {
  const { setCurrentDatabase } = useSchmea();
  const { runner } = useSqlExecute();

  useEffect(() => {
    const cb: BeforeEachEventCallback = async (statement) => {
      if (statement.analyze) {
        if (statement.analyze.type === 'use') {
          setCurrentDatabase(statement.analyze.db);
        }
      }
      return true;
    };

    runner.registerBeforeEach(cb);
    return () => runner.unregisterBeforeEach(cb);
  }, [runner, setCurrentDatabase]);

  return <>{children}</>;
}
