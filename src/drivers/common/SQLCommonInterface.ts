import { DatabaseSchemas } from 'types/SqlSchema';

export default abstract class SQLCommonInterface {
  abstract getSchema(): Promise<DatabaseSchemas>;
}
