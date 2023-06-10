import { SqlStatementPlan } from 'types/SqlStatement';
import { QueryBuilder } from './QueryBuilder';

export default function generateSqlFromPlan(plan: SqlStatementPlan) {
  if (plan.type === 'update') {
    const qb = new QueryBuilder('mysql').table(plan.table).update(plan.values);
    if (plan.where) qb.where(plan.where);
    return qb.toRawSQL();
  }
  return '';
}
