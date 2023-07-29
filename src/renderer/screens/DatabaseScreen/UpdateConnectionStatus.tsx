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
  }, [common, setStatusBarConnectionStatus]);

  useEffect(() => {
    window.electron.listenConnectionStatusChanged((_, status) => {
      setStatusBarConnectionStatus({ status });
    });
    return () => {
      setStatusBarConnectionStatus(undefined);
    };
  }, [setStatusBarConnectionStatus]);

  return <></>;
}
