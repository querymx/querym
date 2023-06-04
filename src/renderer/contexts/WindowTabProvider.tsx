import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useContext,
  useState,
} from 'react';
import { v1 as uuidv1 } from 'uuid';

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
});

export function useWindowTab() {
  return useContext(WindowTabContext);
}

export function WindowTabProvider({ children }: PropsWithChildren) {
  const [tabs, setTabs] = useState<WindowTabItemProps[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>();

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

  return (
    <WindowTabContext.Provider
      value={{ tabs, setTabs, selectedTab, setSelectedTab, newWindow }}
    >
      {children}
    </WindowTabContext.Provider>
  );
}
