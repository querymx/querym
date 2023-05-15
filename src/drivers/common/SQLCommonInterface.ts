import { DatabaseSchemas } from 'drivers/SQLLikeConnection';

export default abstract class SQLCommonInterface {
  abstract getSchema(): Promise<DatabaseSchemas>;
}
