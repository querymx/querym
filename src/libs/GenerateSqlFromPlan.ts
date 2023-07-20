import { SqlStatementPlan } from 'types/SqlStatement';
import { QueryBuilder } from './QueryBuilder';

function convertUnsupportedValue(value: Record<string, unknown>) {
  const result = { ...value };
  for (const key of Object.keys(result)) {
    if (result[key] === null) {
      result[key] = null;
    } else if (typeof result[key] === 'object') {
      result[key] = JSON.stringify(result[key]);
    }
  }

  return result;
}

export default function generateSqlFromPlan(plan: SqlStatementPlan) {
  if (plan.type === 'update') {
    console.log(convertUnsupportedValue(plan.values), plan.values);

    const qb = new QueryBuilder('mysql')
      .table(plan.table)
      .update(convertUnsupportedValue(plan.values));
    if (plan.where) qb.where(convertUnsupportedValue(plan.where));
    return qb.toRawSQL();
  }
  return '';
}
