import { forwardRef } from 'react';
import styles from './styles.module.scss';
import { TextFieldCommonProps } from '.';

const TextAreaField = forwardRef<HTMLTextAreaElement, TextFieldCommonProps>(
  function TextField(
    { label, value, autoFocus, onChange, placeholder, readOnly, onKeyDown },
    ref,
  ) {
    return (
      <div className={styles.input}>
        {label && <label>{label}</label>}

        <div className={styles.content}>
          <textarea
            ref={ref}
            readOnly={readOnly}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => {
              if (onChange) {
                onChange(e.currentTarget.value);
              }
            }}
          />
        </div>
      </div>
    );
  },
);

export default TextAreaField;
