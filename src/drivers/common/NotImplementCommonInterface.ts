import { DatabaseSchemas } from 'types/SqlSchema';
import SQLCommonInterface from './SQLCommonInterface';

export default class NotImplementCommonInterface extends SQLCommonInterface {
  async getSchema(): Promise<DatabaseSchemas> {
    throw 'Not implemented';
  }
}
