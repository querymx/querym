import { useCallback, useRef } from 'react';
import Icon from '../Icon';
import TextField from '../TextField';

interface FileFieldProps {
  label: string;
  value?: string;
  onChange?: (path: string) => void;
}

export default function FileField({ label, value, onChange }: FileFieldProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const onOpenDialogClick = useCallback(() => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  }, [inputFileRef]);

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        actionIcon={<Icon.More />}
        actionClick={onOpenDialogClick}
      />
      <input
        ref={inputFileRef}
        style={{ display: 'none' }}
        type="file"
        onChange={(e) => {
          if (onChange) {
            if (e.currentTarget.files) {
              onChange(e.currentTarget.files[0].path);
            }
          }
        }}
      />
    </>
  );
}
