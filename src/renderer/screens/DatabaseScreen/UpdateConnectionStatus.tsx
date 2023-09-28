import { beautifyConnectionType } from 'libs/Format';
import { useEffect } from 'react';
import { useStatusBar } from 'renderer/components/StatusBar/hook';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';

export default function UpdateConnectionStatus() {
  const { dialect } = useSchema();
  const { common } = useSqlExecute();
  const { setStatusBarConnectionStatus } = useStatusBar();

  useEffect(() => {
    common.getVersion().then((version) => {
      setStatusBarConnectionStatus({
        version: beautifyConnectionType(dialect) + ' ' + version,
        status: 'Connected',
      });
    });
  }, [dialect, common]);

  return <></>;
}
