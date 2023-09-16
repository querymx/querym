import { SQLDialect } from './../language/dist';
import dialect from './mysql/dialect.json';
import tooltips from './mysql/suggestion.json';

export const MySQLDialect = SQLDialect.define(dialect);
export const MySQLTooltips: Record<
  string,
  { syntax: string; description: string }
> = tooltips;
