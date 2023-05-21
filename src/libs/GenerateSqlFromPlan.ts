import { SqlStatementPlan } from 'types/SqlStatement';
import { update } from 'sql-bricks';

export default function generateSqlFromPlan(plan: SqlStatementPlan) {
  if (plan.type === 'update') {
    return update(plan.table, plan.values)
      .where(plan.where || {})
      .toString();
  }
  return '';
}
