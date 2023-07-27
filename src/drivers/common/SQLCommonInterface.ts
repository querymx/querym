import { DatabaseSchemas, TableDefinitionSchema } from 'types/SqlSchema';

export default abstract class SQLCommonInterface {
  abstract getSchema(): Promise<DatabaseSchemas>;
  abstract getTableSchema(
    database: string,
    table: string
  ): Promise<TableDefinitionSchema>;
  abstract switchDatabase(database: string): Promise<boolean>;
}
