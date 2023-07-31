import { SqlStatementPlan } from 'types/SqlStatement';
import { QueryBuilder, qb } from './QueryBuilder';

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
    if (plan.values) {
      const qb = new QueryBuilder('mysql')
        .table(plan.table)
        .update(convertUnsupportedValue(plan.values));
      if (plan.where) qb.where(convertUnsupportedValue(plan.where));
      return qb.toRawSQL();
    }
  } else if (plan.type === 'delete') {
    if (plan.where) {
      return qb('mysql')
        .table(plan.table)
        .where(plan.where)
        .delete()
        .toRawSQL();
    }
  } else if (plan.type === 'insert') {
    if (plan.values) {
      return qb('mysql')
        .table(plan.table)
        .insert(convertUnsupportedValue(plan.values))
        .toRawSQL();
    }
  }

  return '';
}
