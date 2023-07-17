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

interface WindowTabItemProps {
  key: string;
  name: string;
  icon?: ReactElement;
  component: ReactElement;
}

const WindowTabContext = createContext<{
  tabs: WindowTabItemProps[];
  setTabs: React.Dispatch<React.SetStateAction<WindowTabItemProps[]>>;
  selectedTab?: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string | undefined>>;

  setTabData: (key: string, data: unknown) => void;

  newWindow: (
    name: string,
    createComponent: (key: string, name: string) => ReactElement,
    icon?: ReactElement
  ) => void;
}>({
  tabs: [],
  setTabs: () => {
    throw 'Not implemented';
  },
  setSelectedTab: () => {
    throw 'Not implemented';
  },
  newWindow: () => {
    throw 'Not implemented';
  },

  setTabData: () => {
    throw 'Not implemented';
  },
});

export function useWindowTab() {
  return useContext(WindowTabContext);
}

export function WindowTabProvider({ children }: PropsWithChildren) {
  const { setting } = useDatabaseSetting();
  const [allowedClose, setAllowedClose] = useState(false);
  const [tabs, setTabs] = useState<WindowTabItemProps[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>();
  const [tabData] = useState<{ data: Record<string, unknown> }>({ data: {} });

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
                      database={tab.database}
                      table={tab.table}
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

  useEffect(() => {
    if (allowedClose) {
      window.close();
    } else {
      if (setting?.id) {
        const beforeUnload = (e: BeforeUnloadEvent) => {
          e.preventDefault();

          db.table('database_tabs')
            .put({
              id: setting?.id || '',
              selectedTabKey: selectedTab,
              tabs: tabs
                .map((tab) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { component, icon, ...rest } = tab;
                  return {
                    ...rest,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(tabData.data[tab.key] as any),
                  };
                })
                .filter((tab) => !!tab.type),
            })
            .then(() => {
              setAllowedClose(true);
            });

          e.returnValue = true;
        };

        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
      }
    }
  }, [tabs, selectedTab, setting, setAllowedClose, allowedClose, tabData]);

  const setTabData = useCallback(
    (key: string, data: unknown) => {
      tabData.data[key] = data;
    },
    [tabData]
  );

  return (
    <WindowTabContext.Provider
      value={{
        tabs,
        setTabs,
        selectedTab,
        setSelectedTab,
        newWindow,
        setTabData,
      }}
    >
      {children}
    </WindowTabContext.Provider>
  );
}
