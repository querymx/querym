import { useState, useMemo, useCallback } from 'react';
import { faChevronRight, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles.module.scss';
import { useSchema } from 'renderer/contexts/SchemaProvider';
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
  const { currentDatabase, schema } = useSchema();

  const databaseList = useMemo(() => {
    if (schema) {
      const databaseListUnsort = Object.keys(schema);
      databaseListUnsort.sort((a, b) => a.localeCompare(b));
      return databaseListUnsort;
    }
    return [];
  }, [schema]);

  const [selectedDatabase, setSelectedDatabase] = useState<string | undefined>(
    currentDatabase || undefined
  );

  const { common } = useSqlExecute();

  const openDatabase = useCallback(
    (databaseName: string) => {
      if (databaseName !== currentDatabase && databaseName) {
        common
          .switchDatabase(databaseName)
          .then((result) => {
            if (result) {
              onClose();
            }
          })
          .catch(console.error);
      }
    },
    [onClose, common, currentDatabase]
  );

  const onOpenClicked = useCallback(() => {
    if (selectedDatabase) {
      openDatabase(selectedDatabase);
    }
  }, [openDatabase, selectedDatabase]);

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
            onDoubleClick={(item) => {
              openDatabase(item);
            }}
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
  const { currentDatabase } = useSchema();
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
        {currentDatabase ? (
          <>
            <FontAwesomeIcon icon={faDatabase} color="#27ae60" />
            <span>{currentDatabase}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </>
        ) : (
          <>
            <div>
              <div className={styles.ping}></div>
            </div>
            <span>
              <i>Please select database</i>
            </span>
            <FontAwesomeIcon icon={faChevronRight} />
          </>
        )}
      </div>
      <DatabaseSelectionModal onClose={onClose} open={open} />
    </>
  );
}
