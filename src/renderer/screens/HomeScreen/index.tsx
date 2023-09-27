import styles from './styles.module.scss';
import WelcomeScreen from '../WelcomeScreen';
import SplitterLayout from 'renderer/components/Splitter/Splitter';
import ConnectionListTree from '../../components/ConnectionListTree';

export default function HomeScreen() {
  return (
    <div className={styles.dashboard}>
      <SplitterLayout
        secondaryMinSize={200}
        primaryIndex={1}
        secondaryInitialSize={300}
        primaryMinSize={500}
      >
        <ConnectionListTree />
        <WelcomeScreen />
      </SplitterLayout>
    </div>
  );
}
