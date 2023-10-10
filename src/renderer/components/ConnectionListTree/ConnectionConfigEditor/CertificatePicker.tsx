import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './certificate.module.scss';
import {
  faCheckCircle,
  faCircleMinus,
  faCircleXmark,
  faFolder,
} from '@fortawesome/free-solid-svg-icons';
import { useCallback } from 'react';
import { ConnectionSslOption } from 'drivers/base/SQLLikeConnection';

interface PickerButtonProps {
  label: string;
  onChange: (v?: string) => void;
  value?: string;
}

interface CertificatePickerProps {
  value?: ConnectionSslOption;
  onChange: (v: ConnectionSslOption | undefined) => void;
}

function CertificatePickerButton({
  label,
  onChange,
  value,
}: PickerButtonProps) {
  const onClick = useCallback(() => {
    window.electron.showOpenDialog({}).then((e) => {
      if (!e.canceled) {
        if (e.filePaths.length === 1) {
          window.electron
            .readFile(e.filePaths[0])
            .then((content) => onChange(new TextDecoder().decode(content)));
        }
      }
    });
  }, [onChange]);

  const className = [styles.button, value ? styles.provided : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <div onClick={onClick}>
        <FontAwesomeIcon
          icon={value ? faCheckCircle : faCircleMinus}
          style={{ opacity: value ? 1 : 0.4, marginRight: 5 }}
        />

        <span>{label}</span>
      </div>
      {value && (
        <div
          className={`${styles.icon} ${styles.close}`}
          onClick={() => {
            onChange(undefined);
          }}
        >
          <FontAwesomeIcon
            icon={faCircleXmark}
            style={{ opacity: 1, marginRight: 5 }}
          />
        </div>
      )}
      {!value && (
        <div className={styles.icon} onClick={onClick}>
          <FontAwesomeIcon
            icon={faFolder}
            style={{ opacity: 0.4, marginRight: 5 }}
          />
        </div>
      )}
    </div>
  );
}

export default function CertificatePicker({
  value,
  onChange,
}: CertificatePickerProps) {
  const onUpdate = useCallback(
    (property: 'ca' | 'cert' | 'key', newValue?: string) => {
      let tmp: ConnectionSslOption | undefined;
      if (!value) tmp = { [property]: newValue };
      else if (value === true) {
        tmp = { [property]: newValue };
      } else {
        tmp = { ...value, [property]: newValue };
      }

      // Remove all the undefined property
      if (typeof tmp === 'object') {
        for (const tmpKey of Object.keys(tmp)) {
          const key = tmpKey as keyof ConnectionSslOption;
          if (!tmp[key]) {
            delete tmp[key];
          }
        }

        if (Object.entries(tmp).length === 0) {
          onChange(value === true ? true : undefined);
        } else onChange(tmp);
      } else {
        onChange(undefined);
      }
    },
    [value, onChange],
  );

  const ca = typeof value === 'object' ? value.ca : undefined;
  const cert = typeof value === 'object' ? value.cert : undefined;
  const key = typeof value === 'object' ? value.key : undefined;
  const ssl = !!value;

  return (
    <div className={styles.container}>
      <h3>
        <label>
          <input
            type="checkbox"
            checked={ssl}
            onClick={() => {
              if (!value) onChange(true);
              if (value === true) onChange(undefined);
            }}
          />
          <span>&nbsp;&nbsp;Over SSL</span>
        </label>
      </h3>
      <div className={styles.buttonGroup}>
        <CertificatePickerButton
          label="CA Certificate"
          value={ca}
          onChange={(e) => onUpdate('ca', e)}
        />
        <CertificatePickerButton
          label="Certificate"
          value={cert}
          onChange={(e) => onUpdate('cert', e)}
        />
        <CertificatePickerButton
          label="Key"
          value={key}
          onChange={(e) => onUpdate('key', e)}
        />
      </div>
    </div>
  );
}
