import { memo } from 'react';
import TableCellNumber from './TableCellNumber';
import TableCellJson from './TableCellJson';
import { QueryResultHeader } from 'types/SqlResult';
import TableCellDecimal from './TableCellDecimal';
import TableCellEnum from './TableCellEnum';
import { TableCellCustomTypeProps } from './createTableCellType';
import TableCellOther from './TableCellOther';
import TableCellString from './TableCellString';
import TableCellDateString from './TableCellDateString';
import BaseType from 'renderer/datatype/BaseType';
import TableCellPoint from './TableCellPoint';

interface TableCellProps {
  value: BaseType;
  header: QueryResultHeader;
  row: number;
  col: number;
  readOnly?: boolean;
}

function getComponentFromHeader(
  header: QueryResultHeader,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.FC<TableCellCustomTypeProps<any>> {
  if (header.type.type === 'number') {
    return TableCellNumber;
  } else if (header.type.type === 'json') {
    return TableCellJson;
  } else if (header.type.type === 'decimal') {
    return TableCellDecimal;
  } else if (
    ['string_date', 'string_time', 'string_datetime'].includes(header.type.type)
  ) {
    return TableCellDateString;
  } else if (header.type.type === 'enum') {
    return TableCellEnum;
  } else if (['string'].includes(header.type.type)) {
    return TableCellString;
  } else if (header.type.type === 'point') {
    return TableCellPoint;
  }

  return TableCellOther;
}

export default memo(function TableCell(props: TableCellProps) {
  const Component = getComponentFromHeader(props.header);
  return <Component {...props} />;
});
