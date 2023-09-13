import Button from 'renderer/components/Button';
import QueryWindowNameEditor from './QueryWindowNameEditor';
import styles from './QueryHeader.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

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
      <Button primary onClick={onSave} icon={<FontAwesomeIcon icon={faSave} />}>
        Save
      </Button>
    </div>
  );
}
