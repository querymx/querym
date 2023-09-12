import Button from 'renderer/components/Button';
import QueryWindowNameEditor from './QueryWindowNameEditor';
import styles from './QueryHeader.module.scss';

export default function QueryHeader({
  tabKey,
  onSave,
}: {
  tabKey: string;
  onSave: () => void;
}) {
  return (
    <div className={styles.queryHeader}>
      <QueryWindowNameEditor tabKey={tabKey} />
      <Button primary onClick={onSave}>
        Save
      </Button>
    </div>
  );
}
