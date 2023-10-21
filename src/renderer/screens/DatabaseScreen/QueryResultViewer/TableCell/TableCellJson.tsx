import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useMemo, useState } from 'react';
import {
  TableEditableEditorProps,
  TableEditableContentProps,
} from './TableEditableCell';
import createTableCellType from './createTableCellType';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';
import useCodeEditorTheme from 'renderer/components/CodeEditor/useCodeEditorTheme';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import JsonType from 'renderer/datatype/JsonType';

function TableCellJsonEditor({
  value,
  onExit,
  readOnly,
}: TableEditableEditorProps<JsonType>) {
  const jsonStringAfterBeautify = useMemo(() => {
    return value.toNullableString() ?? '';
  }, [value]);

  const [editValue, setEditValue] = useState(jsonStringAfterBeautify);
  const theme = useCodeEditorTheme();

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
          theme={theme}
          extensions={[json()]}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          primary
          onClick={() => {
            onExit(false, new JsonType(editValue));
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

function TableCellJsonContent({ value }: TableEditableContentProps<JsonType>) {
  return (
    <TableCellContent
      value={value.toNullableString()}
      badge="json"
      mono
    />
  );
}

const TableCellJson = createTableCellType({
  diff: (prev: JsonType, current: JsonType) => prev.diff(current),
  content: TableCellJsonContent,
  editor: TableCellJsonEditor,
  detachEditor: true,
  onInsertValue: (value) => {
    if (value === null || value === undefined || typeof value === 'string')
      return new JsonType(value);
    return new JsonType(null);
  },
  onCopy: (value: JsonType) => {
    return value.toString();
  },
  onPaste: (value: string) => {
    return { accept: true, value: new JsonType(value) };
  },
});

export default TableCellJson;
