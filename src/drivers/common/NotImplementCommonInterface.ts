import { DatabaseSchemas, TableDefinitionSchema } from 'types/SqlSchema';
import SQLCommonInterface from './SQLCommonInterface';

export default class NotImplementCommonInterface extends SQLCommonInterface {
  async getSchema(): Promise<DatabaseSchemas> {
    throw 'Not implemented';
  }

  async getTableSchema(): Promise<TableDefinitionSchema> {
    throw 'Not implemented';
  }

  async switchDatabase(): Promise<boolean> {
    throw 'Not implemented';
  }
}
