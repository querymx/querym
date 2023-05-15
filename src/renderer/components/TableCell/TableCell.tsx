import { QueryResultHeader } from 'drivers/SQLLikeConnection';
import TableCellString from './TableCellString';
import TableCellNumber from './TableCellNumber';
import TableCellJson from './TableCellJson';

interface TableCellProps {
  value: unknown;
  header: QueryResultHeader;
}

export default function TableCell({ value, header }: TableCellProps) {
  if (header.type.type === 'number') {
    return <TableCellNumber value={value as number} />;
  } else if (header.type.type === 'json') {
    return <TableCellJson value={value} />;
  }

  return <TableCellString text={value as string} />;
}
