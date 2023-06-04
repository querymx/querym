export interface ConfigurationFileFormat {
  version: number;
  encrypted: boolean;
  theme?: 'light' | 'dark';
  debug?: boolean;
  connections: string;
}
