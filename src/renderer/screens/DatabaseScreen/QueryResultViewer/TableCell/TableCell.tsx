import { memo } from 'react';
import TableCellString from './TableCellString';
import TableCellNumber from './TableCellNumber';
import TableCellJson from './TableCellJson';
import { QueryResultHeader } from 'types/SqlResult';
import TableCellDecimal from './TableCellDecimal';
import TableCellEnum from './TableCellEnum';
import { TableCellCustomTypeProps } from './createTableCellType';

interface TableCellProps {
  value: unknown;
  header: QueryResultHeader;
  row: number;
  col: number;
  readOnly?: boolean;
}

function getComponentFromHeader(
  header: QueryResultHeader
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.FC<TableCellCustomTypeProps<any>> {
  if (header.type.type === 'number') {
    return TableCellNumber;
  } else if (header.type.type === 'json') {
    return TableCellJson;
  } else if (header.type.type === 'decimal') {
    return TableCellDecimal;
  } else if (header.columnDefinition) {
    if (header.columnDefinition.dataType === 'enum') {
      return TableCellEnum;
    }
  }

  return TableCellString;
}

export default memo(function TableCell(props: TableCellProps) {
  const Component = getComponentFromHeader(props.header);
  return <Component {...props} />;
});
