import { useState, useMemo, useCallback } from 'react';
import { faChevronRight, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles.module.scss';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import Modal from '../Modal';
import ListView from '../ListView';
import Button from '../Button';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';

interface DatabaseSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

function DatabaseSelectionModal({
  onClose,
  open,
}: DatabaseSelectionModalProps) {
  const { currentDatabase, schema } = useSchmea();

  const databaseList = useMemo(() => {
    if (schema) {
      return Object.keys(schema);
    }
    return [];
  }, [schema]);

  const [selectedDatabase, setSelectedDatabase] = useState<string | undefined>(
    currentDatabase || undefined
  );

  const { common } = useSqlExecute();

  const onOpenClicked = useCallback(() => {
    if (selectedDatabase !== currentDatabase && selectedDatabase) {
      common
        .switchDatabase(selectedDatabase)
        .then((result) => {
          if (result) {
            onClose();
          }
        })
        .catch(console.error);
    }
  }, [common, selectedDatabase, currentDatabase, onClose]);

  return (
    <Modal open={open} title="Database Selection" onClose={onClose}>
      <Modal.Body>
        <div
          style={{ maxHeight: '50vh', overflowY: 'auto' }}
          className={'scroll'}
        >
          <ListView
            selectedItem={selectedDatabase}
            onSelectChange={(item) => setSelectedDatabase(item)}
            items={databaseList}
            extractMeta={(database) => ({
              text: database,
              key: database,
              icon: <FontAwesomeIcon icon={faDatabase} />,
            })}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button primary onClick={onOpenClicked} disabled={!selectedDatabase}>
          Open
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function DatabaseSelection() {
  const { currentDatabase } = useSchmea();
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <>
      <div className={styles.header} onClick={onOpen}>
        <FontAwesomeIcon icon={faDatabase} color="#27ae60" />
        <span>{currentDatabase}</span>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
      <DatabaseSelectionModal onClose={onClose} open={open} />
    </>
  );
}
