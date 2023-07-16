import CodeMirror from '@uiw/react-codemirror';
import Modal from '../Modal';
import { json } from '@codemirror/lang-json';
import Button from '../Button';
import useCodeEditorTheme from '../CodeEditor/useCodeEditorTheme';
import { useState } from 'react';

interface FullTextEditorProps {
  onExit: () => void;
  onSave?: (value: string | undefined | null) => void;
  readOnly?: boolean;
  defaultValue: string;
}

export default function FullTextEditor({
  onExit,
  defaultValue,
  readOnly,
  onSave,
}: FullTextEditorProps) {
  const [editValue, setEditValue] = useState(defaultValue);
  const theme = useCodeEditorTheme();

  return (
    <Modal title="Editor" open wide onClose={onExit}>
      <Modal.Body noPadding>
        <CodeMirror
          autoFocus
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
            if (onSave) {
              onSave(editValue);
            }
          }}
        >
          Save
        </Button>
        <Button
          onClick={() => {
            onExit();
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
