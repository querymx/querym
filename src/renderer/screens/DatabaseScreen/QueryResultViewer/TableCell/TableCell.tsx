import TableCellString from './TableCellString';
import TableCellNumber from './TableCellNumber';
import TableCellJson from './TableCellJson';
import { QueryResultHeader } from 'types/SqlResult';
import TableCellDecimal from './TableCellDecimal';

interface TableCellProps {
  value: unknown;
  header: QueryResultHeader;
  row: number;
  col: number;
  readOnly?: boolean;
}

export default function TableCell({
  value,
  header,
  row,
  col,
  readOnly,
}: TableCellProps) {
  if (header.type.type === 'number') {
    return (
      <TableCellNumber
        value={value as number}
        row={row}
        col={col}
        readOnly={readOnly}
      />
    );
  } else if (header.type.type === 'json') {
    return (
      <TableCellJson
        value={value as number}
        row={row}
        col={col}
        readOnly={readOnly}
      />
    );
  } else if (header.type.type === 'decimal') {
    return (
      <TableCellDecimal
        value={value as string}
        row={row}
        col={col}
        readOnly={readOnly}
      />
    );
  }

  return (
    <TableCellString
      value={value as string}
      row={row}
      col={col}
      readOnly={readOnly}
    />
  );
}
