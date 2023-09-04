import Button from 'renderer/components/Button';
import QueryWindowNameEditor from './QueryWindowNameEditor';
import styles from './QueryHeader.module.scss';

export default function QueryHeader({ tabKey }: { tabKey: string }) {
  return (
    <div className={styles.queryHeader}>
      <Button primary>Save</Button>
      <QueryWindowNameEditor tabKey={tabKey} />
    </div>
  );
}
