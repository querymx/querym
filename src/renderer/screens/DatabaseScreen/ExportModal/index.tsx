import {
  faFileExcel,
  faFileCsv,
  faCircleCheck,
  faTimesCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useState } from 'react';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import Button from 'renderer/components/Button';
import Modal from 'renderer/components/Modal';
import SelectField from 'renderer/components/SelectField';
import Stack from 'renderer/components/Stack';
import TextField from 'renderer/components/TextField';
import { QueryResult } from 'types/SqlResult';

const EXPORT_OPTIONS = [
  {
    text: 'Excel (*.xlsx)',
    icon: <FontAwesomeIcon color="#27ae60" icon={faFileExcel} />,
    value: 'excel',
  },
  {
    text: 'Comma Separated Value (*.csv)',
    icon: <FontAwesomeIcon color="#e67e22" icon={faFileCsv} />,
    value: 'csv',
  },
];

interface ExportModalProps {
  data: QueryResult;
  onClose: () => void;
}

function ExportModalConfig({
  onExport,
}: {
  onExport: (fileName: string, format: string) => void;
}) {
  const [format, setFormat] = useState('excel');
  const [fileName, setFileName] = useState('');

  const onBrowseFileClicked = useCallback(() => {
    window.electron
      .showSaveDialog({
        filters: [
          format === 'excel'
            ? {
                name: 'Excel',
                extensions: ['xlsx'],
              }
            : {
                name: 'CSV',
                extensions: ['csv'],
              },
        ],
      })
      .then((value) => setFileName(value ?? ''));
  }, [format]);

  return (
    <>
      <Modal.Body>
        <Stack vertical>
          <SelectField
            value={format}
            onChange={setFormat}
            items={EXPORT_OPTIONS}
          />
          <TextField
            value={fileName}
            onChange={setFileName}
            label="Export to"
            actionIcon={<FontAwesomeIcon icon={faEllipsis} />}
            actionClick={onBrowseFileClicked}
          />
        </Stack>
      </Modal.Body>
      <Modal.Footer>
        <Button
          primary
          disabled={!fileName}
          onClick={() => onExport(fileName, format)}
        >
          Export
        </Button>
      </Modal.Footer>
    </>
  );
}

function ExportModalLoading() {
  return (
    <>
      <Modal.Body>
        <br />
        <br />
        <Stack vertical center>
          <FontAwesomeIcon spin icon={faSpinner} fontSize={50} />
          <div style={{ textAlign: 'center' }}>
            <div>Exporting...</div>
          </div>
        </Stack>
      </Modal.Body>
      <Modal.Footer>
        <Button disabled>Export</Button>
      </Modal.Footer>
    </>
  );
}

function ExportModalSuccess({
  fileName,
  onClose,
}: {
  fileName: string;
  onClose: () => void;
}) {
  return (
    <>
      <Modal.Body>
        <div style={{ height: 200 }}>
          <br />
          <br />
          <Stack vertical center>
            <FontAwesomeIcon
              icon={faCircleCheck}
              fontSize={50}
              color={'#27ae60'}
            />
            <div style={{ textAlign: 'center' }}>
              <div>Successful export to</div>
              <div>
                <strong>{fileName}</strong>
              </div>
            </div>
          </Stack>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          primary
          onClick={() => {
            window.electron.showFileInFolder(fileName);
          }}
        >
          Open Folder
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Modal.Footer>
    </>
  );
}

function ExportModalError({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Modal.Body>
        <div style={{ height: 200 }}>
          <br />
          <br />
          <Stack vertical center>
            <FontAwesomeIcon
              icon={faTimesCircle}
              fontSize={50}
              color={'#e74c3c'}
            />
            <div style={{ textAlign: 'center' }}>
              <div>There is something wrong</div>
            </div>
          </Stack>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close</Button>
      </Modal.Footer>
    </>
  );
}

export default function ExportModal({ data, onClose }: ExportModalProps) {
  const [successFilename, setSuccessFilename] = useState('');
  const [stage, setStage] = useState<'CONFIG' | 'SAVING' | 'SUCCESS' | 'ERROR'>(
    'CONFIG'
  );

  const onExportClicked = useCallback(
    (fileName: string, format: string) => {
      setStage('SAVING');
      setSuccessFilename(fileName);

      if (format === 'excel') {
        window.electron
          .saveExcelFile(fileName, data.rows)
          .then(() => setStage('SUCCESS'))
          .catch(() => {
            setStage('ERROR');
          });
      } else if (format === 'csv') {
        window.electron
          .saveCsvFile(fileName, data.rows)
          .then(() => setStage('SUCCESS'))
          .catch(() => {
            setStage('ERROR');
          });
      } else {
        setStage('ERROR');
      }
    },
    [data, setStage, setSuccessFilename]
  );

  return (
    <Modal
      open
      title="Export"
      onClose={() => {
        onClose();
      }}
    >
      {stage === 'CONFIG' && <ExportModalConfig onExport={onExportClicked} />}
      {stage === 'SAVING' && <ExportModalLoading />}
      {stage === 'SUCCESS' && (
        <ExportModalSuccess fileName={successFilename} onClose={onClose} />
      )}
      {stage === 'ERROR' && <ExportModalError onClose={onClose} />}
    </Modal>
  );
}
