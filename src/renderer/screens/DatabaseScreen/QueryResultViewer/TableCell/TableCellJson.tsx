import styles from './styles.module.css';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useMemo, useState } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import deepEqual from 'deep-equal';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';

function TableCellEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps) {
  const jsonStringAfterBeautify = useMemo(() => {
    return JSON.stringify(value, undefined, 2);
  }, [value]);

  const [editValue, setEditValue] = useState(jsonStringAfterBeautify);

  return (
    <Modal
      open
      wide
      title="JSON Editor"
      onClose={() => {
        onExit(true, undefined);
      }}
    >
      <Modal.Body noPadding>
        <CodeMirror
          minHeight="300px"
          style={{ fontSize: 20, height: '100%' }}
          value={editValue}
          onChange={setEditValue}
          readOnly={readOnly}
          maxHeight="50vh"
          extensions={[json()]}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          primary
          onClick={() => {
            onExit(false, JSON.parse(editValue));
          }}
        >
          Save
        </Button>
        <Button
          onClick={() => {
            onExit(true, undefined);
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function TableCellContent({ value }: TableEditableContentProps) {
  return (
    <div className={styles.typedContainer}>
      <div>
        <div className={styles.badge}>json</div>
      </div>
      <div className={styles.code}>
        {value ? JSON.stringify(value) : 'NULL'}
      </div>
    </div>
  );
}

const TableCellJson = createTableCellType({
  diff: (prev: unknown, current: unknown) => !deepEqual(prev, current),
  content: TableCellContent,
  editor: TableCellEditor,
});

export default TableCellJson;
