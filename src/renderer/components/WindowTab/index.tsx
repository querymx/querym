import { faAdd, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useState,
} from 'react';
import styles from './styles.module.scss';

export interface WindowTabItem {
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
  draggable?: boolean;
  onTabDragged?: (key: string, newIndex: number) => void;
  onTabContextMenu?: (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    tab: WindowTabItem
  ) => void;
}

const CurrentTabContext = createContext<{ tabName: string; tabKey: string }>({
  tabName: '',
  tabKey: '',
});

export function useCurrentTab() {
  return useContext(CurrentTabContext);
}

export default function WindowTab({
  tabs,
  selected,
  onTabContextMenu,
  onTabChanged,
  onTabClosed,
  onAddTab,
  draggable = false,
  onTabDragged,
}: WindowTabProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const isTabClosable = tabs.length > 1 && onTabClosed;

  const handleDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    tab: WindowTabItem
  ) => {
    if (draggable) {
      e.dataTransfer.setData('text/plain', tab.key);
      if (onTabChanged) {
        onTabChanged(tab);
      }
    }
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLLIElement>,
    tab: WindowTabItem
  ) => {
    e.preventDefault();
    setHoveredTab(tab.key);
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, newIndex: number) => {
    const droppedTabKey = e.dataTransfer.getData('text/plain');
    if (droppedTabKey && onTabDragged) {
      onTabDragged(droppedTabKey, newIndex);
    }
    setHoveredTab(null);
  };

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
          {tabs.map((tab, index) => {
            const isHoveredTab = tab.key === hoveredTab;
            const isSelectedTab = tab.key === selected;

            return (
              <li
                key={tab.key}
                className={[
                  isSelectedTab ? styles.selected : '',
                  isHoveredTab && !isSelectedTab ? styles['drag-hover'] : '',
                ].join(' ')}
                onClick={() => {
                  if (onTabChanged) {
                    onTabChanged(tab);
                  }
                }}
                draggable={draggable}
                onDragStart={(e) => handleDragStart(e, tab)}
                onDragOver={(e) => handleDragOver(e, tab)}
                onDrop={(e) => handleDrop(e, index)}
                onAuxClick={(e) => {
                  if (!isTabClosable) return;
                  // button = 1 middle click
                  if (e.button === 1 && onTabClosed) {
                    onTabClosed(tab);
                  }
                }}
                onContextMenu={(e) => {
                  if (onTabContextMenu) {
                    onTabContextMenu(e, tab);
                  }
                }}
              >
                {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
                <span>{tab.name}</span>
                {isTabClosable && (
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
          <li style={{ flexGrow: 1 }}></li>
        </ul>
      </div>
      <div className={styles.contentContainer}>
        {tabs.map((tab) => {
          return (
            <div
              className={styles.content}
              key={tab.key}
              style={{
                visibility: tab.key === selected ? 'inherit' : 'hidden',
              }}
            >
              <CurrentTabContext.Provider
                value={{ tabKey: tab.key, tabName: tab.name }}
              >
                {tab.component}
              </CurrentTabContext.Provider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
