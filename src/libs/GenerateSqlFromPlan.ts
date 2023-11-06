import { SqlStatementPlan } from 'types/SqlStatement';
import { QueryBuilder, QueryDialetType, qb } from './QueryBuilder';
import BaseType from 'renderer/datatype/BaseType';

function convertUnsupportedValue(
  value: Record<string, BaseType>,
  dialect: QueryDialetType,
): Record<string, unknown> {
  return Object.keys(value).reduce<Record<string, unknown>>((a, b) => {
    a[b] = value[b].toSQL(dialect);
    return a;
  }, {});
}

export default function generateSqlFromPlan(
  dialect: QueryDialetType,
  plan: SqlStatementPlan,
) {
  if (plan.type === 'update') {
    if (plan.values) {
      const qb = new QueryBuilder(dialect)
        .table(plan.table)
        .update(convertUnsupportedValue(plan.values, dialect));
      if (plan.where) qb.where(convertUnsupportedValue(plan.where, dialect));
      return qb.toRawSQL();
    }
  } else if (plan.type === 'delete') {
    if (plan.where) {
      return qb(dialect)
        .table(plan.table)
        .where(convertUnsupportedValue(plan.where, dialect))
        .delete()
        .toRawSQL();
    }
  } else if (plan.type === 'insert') {
    if (plan.values) {
      return qb(dialect)
        .table(plan.table)
        .insert(convertUnsupportedValue(plan.values, dialect))
        .toRawSQL();
    }
  }

  return '';
}
