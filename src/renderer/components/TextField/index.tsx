import { ReactElement, forwardRef } from 'react';
import styles from './styles.module.scss';

export interface TextFieldCommonProps {
  readOnly?: boolean;
  onChange?: (value: string) => void;
  label?: string;
  value?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
}

interface TextFieldProps extends TextFieldCommonProps {
  type?: 'text' | 'password';
  actionIcon?: ReactElement;
  actionClick?: () => void;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      value,
      autoFocus,
      type,
      onChange,
      placeholder,
      actionIcon,
      actionClick,
      readOnly,
      onKeyDown,
      onBlur,
    },
    ref,
  ) {
    return (
      <div className={styles.input}>
        {label && <label>{label}</label>}

        <div className={styles.content}>
          <input
            ref={ref}
            readOnly={readOnly}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
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
          {actionIcon && (
            <div className={styles.action_icon} onClick={actionClick}>
              {actionIcon}
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default TextField;
