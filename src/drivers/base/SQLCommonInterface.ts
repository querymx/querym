import { DatabaseSchemas, TableDefinitionSchema } from 'types/SqlSchema';

export default abstract class SQLCommonInterface {
  public abstract readonly FLAG_USE_STATEMENT: boolean;

  abstract getVersion(): Promise<string>;
  abstract getSchema(): Promise<DatabaseSchemas>;
  abstract getTableSchema(
    database: string,
    table: string
  ): Promise<TableDefinitionSchema>;
  abstract switchDatabase(database: string): Promise<boolean>;
  abstract estimateTableRowCount(
    database: string,
    table: string
  ): Promise<number | null>;
}
