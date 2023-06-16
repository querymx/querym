export interface ConfigurationFileFormat {
  version: number;
  encrypted: boolean;
  theme?: 'light' | 'dark';
  debug?: boolean;
  connections: string;
}

export interface DatabaseSavedState {
  tabs: {
    key: string;
    name: string;
    sql: string;
    type: string;
    database: string;
    table: string;
  }[];
  selectedTabKey: string;
}
