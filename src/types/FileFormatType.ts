import { WindowTabItemData } from 'renderer/contexts/WindowTabProvider';

export interface ConfigurationFileFormat {
  version: number;
  encrypted: boolean;
  theme?: 'light' | 'dark';
  debug?: boolean;
  connections: string;
}

export interface DatabaseSavedState {
  tabs: ({
    key: string;
    name: string;
  } & WindowTabItemData)[];
  selectedTabKey: string;
}
