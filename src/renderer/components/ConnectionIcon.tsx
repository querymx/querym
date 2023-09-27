import { QueryDialetType } from 'libs/QueryBuilder';
import Icon from './Icon';

export default function ConnectionIcon({
  dialect,
}: {
  dialect: QueryDialetType;
}) {
  if (dialect === 'postgre') return <Icon.PostgreSQL />;
  return <Icon.MySql />;
}
