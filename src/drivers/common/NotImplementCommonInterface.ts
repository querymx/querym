import { DatabaseSchemas } from 'drivers/SQLLikeConnection';
import SQLCommonInterface from './SQLCommonInterface';

export default class NotImplementCommonInterface extends SQLCommonInterface {
  async getSchema(): Promise<DatabaseSchemas> {
    throw 'Not implemented';
  }
}
