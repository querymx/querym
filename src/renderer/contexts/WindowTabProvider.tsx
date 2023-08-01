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
import SqlTableSchemaTab from 'renderer/screens/DatabaseScreen/SqlTableSchemaTab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faTableList } from '@fortawesome/free-solid-svg-icons';
import NotImplementCallback from 'libs/NotImplementCallback';
import useBeforeClose from 'renderer/hooks/useBeforeClose';
import { WindowTabItem } from 'renderer/components/WindowTab';
export interface WindowTabItemData {
  sql?: string;
  type?: string;
  database?: string;
  table?: string;
}

const WindowTabContext = createContext<{
  tabs: WindowTabItem[];
  setTabs: React.Dispatch<React.SetStateAction<WindowTabItem[]>>;
  selectedTab?: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string | undefined>>;
  saveWindowTabHistory: () => void;
  setTabData: (key: string, data: WindowTabItemData) => void;

  newWindow: (
    name: string,
    createComponent: (key: string, name: string) => ReactElement,
    icon?: ReactElement
  ) => void;
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
  const [tabs, setTabs] = useState<WindowTabItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>();
  const [tabData] = useState<{ data: Record<string, WindowTabItemData> }>({
    data: {},
  });

  const newWindow = useCallback(
    (
      name: string,
      createComponent: (key: string, name: string) => ReactElement,
      icon?: ReactElement
    ) => {
      const key = uuidv1();
      setTabs((prev) => {
        return [
          {
            key,
            icon,
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
          if (result) {
            setTabs(
              result.tabs.map((tab) => {
                let component: ReactElement = <div />;
                let icon: ReactElement = <FontAwesomeIcon icon={faCode} />;

                if (tab.type === 'query' || !tab.type) {
                  component = (
                    <QueryWindow
                      tabKey={tab.key}
                      name={tab.name}
                      initialSql={tab.sql}
                    />
                  );
                } else if (tab.type === 'table-schema') {
                  component = (
                    <SqlTableSchemaTab
                      tabKey={tab.key}
                      name={tab.name}
                      database={tab.database ?? ''}
                      table={tab.table ?? ''}
                    />
                  );
                  icon = <FontAwesomeIcon icon={faTableList} color="#3498db" />;
                }

                return {
                  key: tab.key,
                  name: tab.name,
                  icon,
                  component,
                };
              })
            );
            setSelectedTab(result.selectedTabKey);
          } else {
            const key = uuidv1();
            setTabs([
              {
                key,
                name: 'Unnamed Query',
                component: <QueryWindow tabKey={key} name={'Unnamed Query'} />,
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
