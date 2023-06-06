import { useState, useCallback, useRef } from 'react';
import Icon from 'renderer/components/Icon';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import styles from './styles.module.scss';

interface QueryWindowNameEditorProps {
  tabKey: string;
}

export default function QueryWindowNameEditor({
  tabKey,
}: QueryWindowNameEditorProps) {
  const { tabs, setTabs } = useWindowTab();
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(
    tabs.find((tab) => tab.key === tabKey)?.name || 'Unnamed'
  );
  const [editValue, setEditValue] = useState('');

  const onEditClick = useCallback(() => {
    setEditMode(true);
    setEditValue(name);
  }, [setEditMode, setEditValue, name]);

  const onCompleteEdit = useCallback(() => {
    setName(editValue);
    setEditMode(false);
    setTabs((prev) => {
      return prev.map((tab) => {
        if (tab.key === tabKey) {
          return {
            ...tab,
            name: editValue,
          };
        }
        return tab;
      });
    });
  }, [editValue, setName, setEditMode, setTabs, tabKey]);

  return (
    <div className={styles.queryNameEditor}>
      <div style={{ fontWeight: 'bold', position: 'relative' }}>
        {editMode ? (
          <>
            <span
              ref={spanRef}
              style={{
                opacity: 0,
                fontWeight: 'bold',
                display: 'block',
                paddingRight: 10,
              }}
            >
              {editValue}
            </span>
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={editValue}
              onKeyDown={(e) => {
                if (e.key === 'Esc') {
                  setEditValue(name);
                  setEditMode(false);
                } else if (e.key === 'Enter') {
                  onCompleteEdit();
                }
              }}
              onChange={(e) => setEditValue(e.currentTarget.value)}
              onBlur={onCompleteEdit}
            />
          </>
        ) : (
          name
        )}
      </div>
      <div onClick={onEditClick}>
        <Icon.More size="md" inline followTheme />
      </div>
    </div>
  );
}
