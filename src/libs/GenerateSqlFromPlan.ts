import { SqlStatementPlan } from 'types/SqlStatement';
import { update } from 'sql-bricks';

function convertUnsupportedValue(value: Record<string, unknown>) {
  const result = { ...value };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'object') {
      result[key] = JSON.stringify(result[key]);
    }
  }

  return result;
}

export default function generateSqlFromPlan(plan: SqlStatementPlan) {
  if (plan.type === 'update') {
    return update(plan.table, convertUnsupportedValue(plan.values))
      .where(convertUnsupportedValue(plan.where || {}))
      .toString();
  }
  return '';
}
