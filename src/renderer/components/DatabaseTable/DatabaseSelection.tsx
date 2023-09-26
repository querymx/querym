import { useState, useMemo, useCallback } from 'react';
import { faChevronRight, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles.module.scss';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import Modal from '../Modal';
import ListView from '../ListView';
import Button from '../Button';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import TextField from '../TextField';

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
      const databaseListUnsort = Object.keys(schema.getSchema());
      databaseListUnsort.sort((a, b) => a.localeCompare(b));
      return databaseListUnsort;
    }
    return [];
  }, [schema]);

  const [selectedDatabase, setSelectedDatabase] = useState<string | undefined>(
    currentDatabase || undefined
  );
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { common } = useSqlExecute();

  const filteredDatabaseList = useMemo(() => {
    return databaseList.filter((database) =>
      database.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [databaseList, searchTerm]);

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
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Search for a database..."
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
          />
        </div>
        <div
          style={{ minHeight: '15vh', maxHeight: '50vh', overflowY: 'auto' }}
          className={'scroll'}
        >
          {filteredDatabaseList.length === 0 ? (
            <p className={styles.noResultsText}>No matching databases found.</p>
          ) : (
            <ListView
              highlight={searchTerm || undefined}
              selectedItem={selectedDatabase}
              onSelectChange={(item) => setSelectedDatabase(item)}
              items={filteredDatabaseList}
              onDoubleClick={(item) => {
                openDatabase(item);
              }}
              extractMeta={(database) => ({
                text: database,
                key: database,
                icon: <FontAwesomeIcon icon={faDatabase} />,
              })}
            />
          )}
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
