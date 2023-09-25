import { DatabaseSchemas, TableDefinitionSchema } from 'types/SqlSchema';
import SQLCommonInterface from './SQLCommonInterface';

export default class NotImplementCommonInterface extends SQLCommonInterface {
  public FLAG_USE_STATEMENT = false;

  async getSchema(): Promise<DatabaseSchemas> {
    throw new Error('Not implemented');
  }

  async getTableSchema(): Promise<TableDefinitionSchema> {
    throw new Error('Not implemented');
  }

  async switchDatabase(): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async getVersion(): Promise<string> {
    throw new Error('Not implemented');
  }

  async estimateTableRowCount(): Promise<number | null> {
    throw new Error('Not implemented');
  }
}
