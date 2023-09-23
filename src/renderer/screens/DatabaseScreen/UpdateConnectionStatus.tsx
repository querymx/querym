import { useEffect } from 'react';
import { useStatusBar } from 'renderer/components/StatusBar/hook';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';

export default function UpdateConnectionStatus() {
  const { common } = useSqlExecute();
  const { setStatusBarConnectionStatus } = useStatusBar();

  useEffect(() => {
    common.getVersion().then((version) => {
      setStatusBarConnectionStatus({ version, status: 'Connected' });
    });
  }, [common]);

  return <></>;
}
