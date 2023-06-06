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

interface WindowTabItemProps {
  key: string;
  name: string;
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
    createComponent: (key: string, name: string) => ReactElement
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
      createComponent: (key: string, name: string) => ReactElement
    ) => {
      const key = uuidv1();
      setTabs((prev) => {
        return [
          {
            key,
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
              result.tabs.map((tab) => ({
                key: tab.key,
                name: tab.name,
                component: (
                  <QueryWindow
                    tabKey={tab.key}
                    name={tab.name}
                    initialSql={tab.sql}
                  />
                ),
              }))
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
              tabs: tabs.map((tab) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { component, ...rest } = tab;
                return {
                  ...rest,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  sql: (tabData.data[tab.key] as any)?.sql || undefined,
                };
              }),
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
