import ConnectionListRemoteStorage from 'libs/ConnectionListStorage/ConnectionListRemoteStorage';
import { useMemo } from 'react';
import ConnectionListTree from 'renderer/components/ConnectionListTree';
import { useAuth, useCurrentUser } from 'renderer/contexts/AuthProvider';
import styles from './remote.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

function BlurredEmptyConnection() {
  return (
    <div className={styles.container}>
      <div className={styles.blurred}></div>
      <div className={styles.message}>
        <FontAwesomeIcon
          icon={faLock}
          style={{ fontSize: 20, marginBottom: '1rem' }}
        />
        <p>Provide the correct master password to unlock your connections</p>
      </div>
    </div>
  );
}

export default function RemoteConnectionList() {
  const { api, masterPassword } = useAuth();
  const { user, isValidMasterPassword } = useCurrentUser();

  const remoteStorage = useMemo(
    () =>
      new ConnectionListRemoteStorage(
        api,
        masterPassword ?? '',
        user?.salt ?? '',
      ),
    [user, api, masterPassword],
  );

  return (
    <div style={{ height: '100%' }}>
      {!isValidMasterPassword ? (
        <BlurredEmptyConnection />
      ) : (
        <ConnectionListTree storage={remoteStorage} />
      )}
    </div>
  );
}
