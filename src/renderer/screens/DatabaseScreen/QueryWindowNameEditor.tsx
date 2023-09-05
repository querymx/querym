import { useState, useCallback, useRef } from 'react';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import styles from './styles.module.scss';

interface QueryWindowNameEditorProps {
  tabKey: string;
}

export default function QueryWindowNameEditor({
  tabKey,
}: QueryWindowNameEditorProps) {
  const { tabs, setTabs } = useWindowTab();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(
    tabs.find((tab) => tab.key === tabKey)?.name || 'Unnamed'
  );

  const onCompleteEdit = useCallback(() => {
    setTabs((prev) => {
      return prev.map((tab) => {
        if (tab.key === tabKey) {
          return {
            ...tab,
            name,
          };
        }
        return tab;
      });
    });
  }, [name, setName, setTabs, tabKey]);

  return (
    <div className={styles.queryNameEditor}>
      <input
        ref={inputRef}
        autoFocus
        type="text"
        value={name}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onCompleteEdit();
          }
        }}
        onBlur={() => onCompleteEdit()}
        onChange={(e) => setName(e.currentTarget.value)}
      />
    </div>
  );
}
