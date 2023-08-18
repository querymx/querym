import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import TextField, { TextFieldCommonProps } from 'renderer/components/TextField';

export default function PasswordField({
  label,
  value,
  autoFocus,
  onChange,
  placeholder,
  readOnly,
}: TextFieldCommonProps) {
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
}
