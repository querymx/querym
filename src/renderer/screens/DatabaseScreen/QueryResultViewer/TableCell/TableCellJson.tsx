import { useState, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

import styles from './styles.module.css';
import Modal from '../../../../components/Modal';
import Button from '../../../../components/Button';

interface TableCellJsonProps {
  value: unknown;
}

export default function TableCellJson({ value }: TableCellJsonProps) {
  const [openEditor, setOpenEditor] = useState(false);
  const jsonStringAfterBeautify = useMemo(() => {
    return JSON.stringify(value, undefined, 2);
  }, [value]);

  return (
    <>
      {openEditor && (
        <Modal
          open
          wide
          title="JSON Editor"
          onClose={() => setOpenEditor(false)}
        >
          <Modal.Body noPadding>
            <CodeMirror
              style={{ fontSize: 20, height: '100%' }}
              value={jsonStringAfterBeautify}
              readOnly
              maxHeight="50vh"
              extensions={[json()]}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
      <div className={styles.typedContainer}>
        <div onDoubleClick={() => setOpenEditor(true)}>
          <div className={styles.badge}>json</div>
        </div>
        <div className={styles.code}>
          {value ? JSON.stringify(value) : 'NULL'}
        </div>
      </div>
    </>
  );
}
