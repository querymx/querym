import { ReactElement } from 'react';
import styles from './styles.module.scss';

interface TextFieldProps {
  label: string;
  value?: string;
  autoFocus?: boolean;
  placeholder?: string;
  multipleLine?: boolean;
  type?: 'text' | 'password';
  onChange?: (value: string) => void;
  actionIcon?: ReactElement;
  actionClick?: () => void;
  readOnly?: boolean;
}

export default function TextField({
  label,
  value,
  autoFocus,
  type,
  onChange,
  placeholder,
  actionIcon,
  actionClick,
  readOnly,
  multipleLine,
}: TextFieldProps) {
  return (
    <div className={styles.input}>
      {label && <label>{label}</label>}

      <div className={styles.content}>
        {multipleLine ? (
          <textarea
            readOnly={readOnly}
            placeholder={placeholder}
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => {
              if (onChange) {
                onChange(e.currentTarget.value);
              }
            }}
          />
        ) : (
          <input
            readOnly={readOnly}
            placeholder={placeholder}
            type={type || 'text'}
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => {
              if (onChange) {
                onChange(e.currentTarget.value);
              }
            }}
          />
        )}
        {actionIcon && (
          <div className={styles.action_icon} onClick={actionClick}>
            {actionIcon}
          </div>
        )}
      </div>
    </div>
  );
}
