import { QueryDialetType } from './QueryBuilder';

export function beautifyConnectionType(type: QueryDialetType) {
  if (type === 'mysql') return 'MySQL';
  return 'PostgreSQL';
}
