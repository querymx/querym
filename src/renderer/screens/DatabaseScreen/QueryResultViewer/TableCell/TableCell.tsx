import { memo } from 'react';
import TableCellNumber from './TableCellNumber';
import TableCellJson from './TableCellJson';
import { QueryResultHeader } from 'types/SqlResult';
import TableCellDecimal from './TableCellDecimal';
import TableCellEnum from './TableCellEnum';
import { TableCellCustomTypeProps } from './createTableCellType';
import TableCellOther from './TableCellOther';
import TableCellString from './TableCellString';

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
  } else if (['string'].includes(header.type.type)) {
    if (header.columnDefinition) {
      if (header.columnDefinition.dataType === 'enum') {
        return TableCellEnum;
      }
    }

    return TableCellString;
  }

  return TableCellOther;
}

export default memo(function TableCell(props: TableCellProps) {
  const Component = getComponentFromHeader(props.header);
  return <Component {...props} />;
});
