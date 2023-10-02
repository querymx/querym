import styles from './styles.module.scss';
import WelcomeScreen from '../WelcomeScreen';
import SplitterLayout from 'renderer/components/Splitter/Splitter';
import ConnectionListTree from '../../components/ConnectionListTree';
import WindowTab from 'renderer/components/WindowTab';
import { useMemo, useState, useEffect } from 'react';
import { useCurrentUser } from 'renderer/contexts/AuthProvider';
import ConnectionListLocalStorage from 'libs/ConnectionListStorage/ConnectionListLocalStorage';
import RemoteConnectionList from './RemoteConnectionList';

export default function HomeScreen() {
  const { user } = useCurrentUser();
  const [selected, setSelected] = useState('local');

  const localStorage = useMemo(() => new ConnectionListLocalStorage(), []);

  const tabs = useMemo(() => {
    if (user) {
      return [
        {
          key: 'remote',
          name: 'Remote',
          component: <RemoteConnectionList />,
        },
        {
          key: 'local',
          name: 'Local',
          component: <ConnectionListTree storage={localStorage} />,
        },
      ];
    } else {
      return [
        {
          key: 'local',
          name: 'Local',
          component: <ConnectionListTree storage={localStorage} />,
        },
      ];
    }
  }, [user, localStorage]);

  useEffect(() => {
    if (user) setSelected('remote');
    else setSelected('local');
  }, [user]);

  return (
    <div className={styles.dashboard}>
      <SplitterLayout
        secondaryMinSize={200}
        primaryIndex={1}
        secondaryInitialSize={300}
        primaryMinSize={500}
      >
        <WindowTab
          selected={selected}
          tabs={tabs}
          onTabChanged={(tab) => setSelected(tab.key)}
        />
        <WelcomeScreen />
      </SplitterLayout>
    </div>
  );
}
