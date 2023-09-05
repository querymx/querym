import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './cells.module.scss';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import AvoidOffscreen from '../AvoidOffscreen';
import DropContainer from '../DropContainer';
import OptionList from '../OptionList';
import OptionListGroup from '../OptionList/OptionListGroup';
import OptionListItem from '../OptionList/OptionListItem';
import TextField from '../TextField';

interface CellGroupSelectInputProps {
  items: { name: string; items: { value: string; text: string }[] }[];
  value?: string;
}

export default function CellGroupSelectInput({
  items,
  value,
}: CellGroupSelectInputProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && show) {
      const onDocumentClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setShow(false);
        }
      };

      document.addEventListener('click', onDocumentClick);
      return () => document.removeEventListener('click', onDocumentClick);
    }
  }, [ref, show, setShow]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className={styles.dropdownContainer}
        onClick={() => {
          setShow(true);
        }}
      >
        <div className={styles.dropdownContent}>{value}</div>
        <div className={styles.dropdownArrow}>
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>
      {show && (
        <div style={{ position: 'absolute', zIndex: 100 }}>
          <AvoidOffscreen>
            <DropContainer>
              <div style={{ padding: 5 }}>
                <TextField autoFocus placeholder="Search type" />
              </div>
              <div
                style={{ height: 300, width: 250, overflowY: 'auto' }}
                className="scroll"
              >
                <OptionList>
                  {items.map((group) => {
                    return (
                      <OptionListGroup key={group.name} text={group.name}>
                        {group.items.map((sub) => {
                          return (
                            <OptionListItem key={sub.value} text={sub.text} />
                          );
                        })}
                      </OptionListGroup>
                    );
                  })}
                </OptionList>
              </div>
            </DropContainer>
          </AvoidOffscreen>
        </div>
      )}
    </div>
  );
}
