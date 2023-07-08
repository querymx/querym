import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import pkg from './../../../../package.json';
import Button from '../Button';
import Stack from '../Stack';
import ButtonGroup from '../ButtonGroup';

function StatusBarAutoUpdate() {
  const [autoUpdateMessage, setAutoUpdateMessage] = useState('');
  const [autoUpdateProgress, setAutoUpdateProgress] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    window.electron.listenCheckingForUpdate(() =>
      setAutoUpdateMessage('Checking for update...')
    );

    window.electron.listenUpdateNotAvailable(() => {
      setAutoUpdateMessage('Up to date');
    });

    window.electron.listenUpdateAvailable(console.log);

    window.electron.listenUpdateDownloadProgress((_, e) => {
      setAutoUpdateProgress(e.percent);
    });

    window.electron.listenUpdateDownloaded(() => {
      setDownloadCompleted(true);
      setShowUpdateModal(true);
    });

    window.electron.checkForUpdates();
    console.log('Check for update');
  }, [setAutoUpdateMessage, setDownloadCompleted, setShowUpdateModal]);

  if (downloadCompleted) {
    return (
      <>
        {showUpdateModal && (
          <div className={styles.popup}>
            <Stack vertical spacing="md">
              <h1>New Update!</h1>
              <p>
                There is new update. Restart QueryMaster to use the latest
                version.
              </p>

              <ButtonGroup>
                <Button
                  primary
                  onClick={() => window.electron.quitAndInstall()}
                >
                  Restart
                </Button>
                <Button primary onClick={() => setShowUpdateModal(false)}>
                  Later
                </Button>
              </ButtonGroup>
            </Stack>
          </div>
        )}
        <li>New update is available. Restart for update</li>
      </>
    );
  }

  if (autoUpdateProgress > 0) {
    return (
      <li style={{ display: 'flex', gap: 10 }}>
        Downloading Update ({autoUpdateProgress.toFixed(0)}%)
        <div
          style={{
            width: 150,
            background: '#fffa',
            height: '100%',
          }}
        >
          <div
            style={{
              width: `${autoUpdateProgress}%`,
              background: '#16a085',
              height: '100%',
            }}
          ></div>
        </div>
      </li>
    );
  }

  return <li>{autoUpdateMessage}</li>;
}

export default function StatusBar() {
  return (
    <div className={styles.statusBarContainer}>
      <ul>
        <li>QueryMaster v{pkg.version}</li>
        <li style={{ flexGrow: 1 }}></li>
        <StatusBarAutoUpdate />
      </ul>
    </div>
  );
}
