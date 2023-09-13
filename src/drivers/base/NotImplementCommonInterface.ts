import { DatabaseSchemas, TableDefinitionSchema } from 'types/SqlSchema';
import SQLCommonInterface from './SQLCommonInterface';

export default class NotImplementCommonInterface extends SQLCommonInterface {
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
}
