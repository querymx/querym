import { BeforeEachEventCallback } from 'libs/SqlRunnerManager';
import { PropsWithChildren, useEffect } from 'react';
import { useSchema } from './SchemaProvider';
import { useSqlExecute } from './SqlExecuteProvider';

export default function SwitchDatabaseProvider({
  children,
}: PropsWithChildren) {
  const { setCurrentDatabase, reloadSchema } = useSchema();
  const { runner } = useSqlExecute();

  useEffect(() => {
    const cb: BeforeEachEventCallback = async (statement) => {
      if (statement.analyze) {
        if (statement.analyze.type === 'use') {
          setCurrentDatabase(statement.analyze.db);
        }
        if (
          statement.analyze.type === 'create' ||
          // only has delete, while drop is fired instead
          // @ts-expect-error TODO: fix this
          statement.analyze.type === 'drop'
        ) {
          reloadSchema();
        }
      }
      return true;
    };

    runner.registerBeforeEach(cb);
    return () => runner.unregisterBeforeEach(cb);
  }, [runner, setCurrentDatabase]);

  return <>{children}</>;
}
