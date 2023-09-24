import { SQLDialect } from '../language/dist';
import dialect from './pg/dialect.json';
import tooltips from './pg/suggestion.json';

export const PgDialect = SQLDialect.define(dialect);
export const PgTooltips: Record<
  string,
  { syntax: string; description: string }
> = tooltips;
