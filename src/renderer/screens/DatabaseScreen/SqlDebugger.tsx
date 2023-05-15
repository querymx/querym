import { BeforeEachEventCallback } from 'libs/SqlRunnerManager';
import { useEffect, useState } from 'react';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';

export default function SqlDebugger() {
  const { runner } = useSqlExecute();
  const [statements, setStatements] = useState<string[]>([]);

  useEffect(() => {
    const cb: BeforeEachEventCallback = async (_, statement) => {
      setStatements((prev) => [statement.sql, ...prev]);
      return true;
    };

    runner.registerBeforeEach(cb);
    return () => runner.unregisterBeforeEach(cb);
  }, [runner, setStatements]);

  return (
    <div>
      <ul>
        {statements.map((sql, idx) => (
          <li key={idx}>
            <pre>
              <code>{sql}</code>
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
