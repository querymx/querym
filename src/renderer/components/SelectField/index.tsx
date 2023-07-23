import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import styles from './styles.module.scss';
import AttachedContextMenu from '../ContextMenu/AttachedContextMenu';
import { ReactElement } from 'react';

interface SelectFieldProps {
  value?: string;
  items: { icon?: ReactElement; text: string; value: string }[];
  onChange?: (value: string) => void;
}

export default function SelectField({
  value,
  items,
  onChange,
}: SelectFieldProps) {
  const selected = items.find((item) => item.value === value);

  return (
    <div className={styles.input}>
      <AttachedContextMenu
        activator={({ isOpened }) => {
          return (
            <div className={styles.content}>
              {selected ? (
                <>
                  {selected.icon && (
                    <div>
                      {selected.icon}
                      &nbsp; &nbsp;
                    </div>
                  )}
                  <div style={{ flexGrow: 1 }}>{selected.text}</div>
                </>
              ) : (
                <div>Please select</div>
              )}
              <div>
                <FontAwesomeIcon
                  icon={isOpened ? faChevronRight : faChevronDown}
                />
              </div>
            </div>
          );
        }}
        items={items.map((item) => ({
          text: item.text,
          icon: item.icon,
          onClick: () => {
            if (onChange) {
              onChange(item.value);
            }
          },
        }))}
      />
    </div>
  );
}
