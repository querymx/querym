import BaseType from 'renderer/datatype/BaseType';

export interface SqlStatement {
  sql: string;
  params?: Record<string, unknown>;
}

/**
 * This is intermedia representation that
 * is easy to transform it into raw SQL
 */
export interface SqlStatementPlan {
  type: 'insert' | 'delete' | 'update';
  table: string;
  values?: Record<string, BaseType>;
  where?: Record<string, BaseType>;
}
