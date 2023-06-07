import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';

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

  return (
    <div className={styles.queryLoading}>
      <div style={{ fontSize: 40 }}>
        <FontAwesomeIcon icon={faSpinner} spin />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div>
          <strong>QueryMaster</strong> is fetching result from your database
          server
        </div>
        <div>{Math.round((currentTime - initialTime) / 1000)} seconds</div>
      </div>
    </div>
  );
}
