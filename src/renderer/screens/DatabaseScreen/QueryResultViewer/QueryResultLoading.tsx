import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles.module.scss';
import { useEffect, useState, useCallback } from 'react';
import Toolbar from 'renderer/components/Toolbar';

export default function QueryResultLoading() {
  const [initialTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const onSecondCounter = () => {
      setCurrentTime(Date.now());
    };

    const intervalId = setInterval(onSecondCounter, 1000);
    return () => clearInterval(intervalId);
  }, [setCurrentTime]);

  const onTerminateQueryClicked = useCallback(() => {
    window.electron.killCurrentQuery();
  }, []);

  return (
    <div className={styles.result}>
      <div className={styles.container}></div>
      <Toolbar shadowTop>
        <Toolbar.Text>
          <div
            style={{
              width: 125,
              alignItems: 'center',
              display: 'flex',
            }}
          >
            Querying&nbsp;&nbsp;
            <FontAwesomeIcon icon={faSpinner} spin /> &nbsp;{' '}
            {Math.round((currentTime - initialTime) / 1000)}s
          </div>
        </Toolbar.Text>
        <Toolbar.Separator />
        <Toolbar.Item
          onClick={onTerminateQueryClicked}
          text="Terminate"
          destructive
        />
      </Toolbar>
    </div>
  );
}
