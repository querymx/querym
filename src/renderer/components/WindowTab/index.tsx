import { faAdd, faClose, faCode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactElement, ReactNode } from 'react';
import styles from './styles.module.scss';

interface WindowTabItem {
  key: string;
  name: string;
  icon?: ReactElement;
  component: ReactNode;
}

interface WindowTabProps {
  tabs: WindowTabItem[];
  selected?: string;
  onTabChanged?: (tab: WindowTabItem) => void;
  onTabClosed?: (tab: WindowTabItem) => void;
  onAddTab?: () => void;
}

export default function WindowTab({
  tabs,
  selected,
  onTabChanged,
  onTabClosed,
  onAddTab,
}: WindowTabProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {onAddTab && (
          <div className={styles.add} onClick={onAddTab}>
            <span className={styles.icon}>
              <FontAwesomeIcon icon={faAdd} />
            </span>
          </div>
        )}

        <ul
          onWheel={(e) => {
            if (e.currentTarget) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
        >
          {tabs.map((tab) => {
            return (
              <li
                draggable
                key={tab.key}
                className={selected === tab.key ? styles.selected : undefined}
                onClick={() => {
                  if (onTabChanged) {
                    onTabChanged(tab);
                  }
                }}
              >
                <span className={styles.icon}>
                  {tab.icon ? tab.icon : <FontAwesomeIcon icon={faCode} />}
                </span>
                <span>{tab.name}</span>
                {tabs.length > 1 && onTabClosed && (
                  <span
                    className={styles.close}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (onTabClosed) {
                        onTabClosed(tab);
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faClose} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className={styles.contentContainer}>
        {tabs.map((tab) => {
          return (
            <div
              className={styles.content}
              key={tab.key}
              style={{
                visibility: tab.key === selected ? 'visible' : 'hidden',
              }}
            >
              {tab.component}
            </div>
          );
        })}
      </div>
    </div>
  );
}
