import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, forwardRef } from 'react';
import TextField, { TextFieldCommonProps } from 'renderer/components/TextField';

const PasswordField = forwardRef<HTMLInputElement, TextFieldCommonProps>(
  function PasswordField(
    { label, value, autoFocus, onChange, placeholder, readOnly },
    ref,
  ) {
    const props = {
      label,
      value,
      autoFocus,
      onChange,
      placeholder,
      readOnly,
    };
    const [showPassword, setShowPassword] = useState(false);

    return (
      <TextField
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        actionClick={() => setShowPassword(!showPassword)}
        actionIcon={
          showPassword ? (
            <FontAwesomeIcon icon={faEye} />
          ) : (
            <FontAwesomeIcon icon={faEyeSlash} />
          )
        }
        {...props}
      />
    );
  },
);

export default PasswordField;
