export interface ConfigurationFileFormat {
  version: number;
  encrypted: boolean;
  theme?: 'light' | 'dark';
  debug?: boolean;
  config: string;
}
