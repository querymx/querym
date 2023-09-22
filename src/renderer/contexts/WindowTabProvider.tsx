import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { v1 as uuidv1 } from 'uuid';
import { useDatabaseSetting } from './DatabaseSettingProvider';
import { db } from 'renderer/db';
import { DatabaseSavedState } from 'types/FileFormatType';
import QueryWindow from 'renderer/screens/DatabaseScreen/QueryWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import NotImplementCallback from 'libs/NotImplementCallback';
import useBeforeClose from 'renderer/hooks/useBeforeClose';

export interface WindowTabItemProps {
  key: string;
  name: string;
  icon?: ReactElement;
  component: ReactElement;
}

export interface WindowTabItemData {
  sql?: string;
  type?: string;
  database?: string;
  table?: string;
}

type NewWindowCallback = (
  name: string,
  createComponent: (key: string, name: string) => ReactElement,
  options: { icon?: ReactElement; overrideKey?: string }
) => void;

const WindowTabContext = createContext<{
  tabs: WindowTabItemProps[];
  setTabs: React.Dispatch<React.SetStateAction<WindowTabItemProps[]>>;
  selectedTab?: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string | undefined>>;
  saveWindowTabHistory: () => void;
  setTabData: (key: string, data: WindowTabItemData) => void;
  newWindow: NewWindowCallback;
}>({
  tabs: [],
  setTabs: NotImplementCallback,
  setSelectedTab: NotImplementCallback,
  newWindow: NotImplementCallback,
  setTabData: NotImplementCallback,
  saveWindowTabHistory: NotImplementCallback,
});

export function useWindowTab() {
  return useContext(WindowTabContext);
}

export function WindowTabProvider({ children }: PropsWithChildren) {
  const { setting } = useDatabaseSetting();
  const [tabs, setTabs] = useState<WindowTabItemProps[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>();
  const [tabData] = useState<{ data: Record<string, WindowTabItemData> }>({
    data: {},
  });

  const newWindow = useCallback<NewWindowCallback>(
    (
      name: string,
      createComponent: (key: string, name: string) => ReactElement,
      options
    ) => {
      const key = options?.overrideKey ?? uuidv1();

      setTabs((prev) => {
        return [
          {
            key,
            icon: options.icon,
            name,
            component: createComponent(key, name),
          },
          ...prev,
        ];
      });

      setSelectedTab(key);
    },
    [setSelectedTab, setTabs]
  );

  useEffect(() => {
    if (setting?.id) {
      db.table('database_tabs')
        .get(setting.id)
        .then((result: DatabaseSavedState | null) => {
          let emptyTab = true;

          if (result) {
            const tabs = result.tabs.map((tab) => {
              let component: ReactElement = <div />;
              const icon: ReactElement = <FontAwesomeIcon icon={faCode} />;

              if (tab.type === 'query' || !tab.type) {
                component = <QueryWindow initialSql={tab.sql} />;
              }

              return {
                key: tab.key,
                name: tab.name,
                icon,
                component,
              };
            });

            if (tabs.length > 0) {
              emptyTab = false;
              setTabs(tabs);
              setSelectedTab(
                tabs.find((tab) => tab.key === result.selectedTabKey)
                  ? result.selectedTabKey
                  : tabs[0].key
              );
            }
          }

          if (emptyTab) {
            const key = uuidv1();
            setTabs([
              {
                key,
                name: 'Unnamed Query',
                component: <QueryWindow />,
              },
            ]);
            setSelectedTab(key);
          }
        });
    }
  }, [setTabs, setSelectedTab, setting]);

  const saveWindowTabHistory = useCallback(async () => {
    return db.table('database_tabs').put({
      id: setting?.id || '',
      selectedTabKey: selectedTab,
      tabs: tabs
        .map((tab) => {
          const { component, icon, ...rest } = tab;
          return {
            ...rest,
            ...tabData.data[tab.key],
          };
        })
        .filter((tab) => !!tab.type),
    });
  }, [tabs, selectedTab, tabData]);

  // ------------------------------------------------
  // Notify there are some data changed for a tab
  // ------------------------------------------------
  const setTabData = useCallback(
    (key: string, data: WindowTabItemData) => {
      tabData.data[key] = data;
    },
    [tabData]
  );

  // ------------------------------------------------
  // Save the tab history before close the app
  // ------------------------------------------------
  useBeforeClose(async () => {
    await saveWindowTabHistory();
    return true;
  }, [saveWindowTabHistory]);

  return (
    <WindowTabContext.Provider
      value={{
        tabs,
        setTabs,
        selectedTab,
        setSelectedTab,
        newWindow,
        setTabData,
        saveWindowTabHistory,
      }}
    >
      {children}
    </WindowTabContext.Provider>
  );
}
