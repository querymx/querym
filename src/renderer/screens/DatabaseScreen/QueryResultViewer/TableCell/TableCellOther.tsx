import { getDisplayableFromDatabaseValue } from 'libs/TransformResult';
import { TableEditableContentProps } from './TableEditableCell';
import createTableCellType from './createTableCellType';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';

function TableCellStringContent({ header, value }: TableEditableContentProps) {
  return (
    <TableCellContent
      value={getDisplayableFromDatabaseValue(value, header.columnDefinition)}
    />
  );
}

const TableCellOther = createTableCellType({
  readOnly: true,
  diff: (prev: string, current: string) => prev !== current,
  content: TableCellStringContent,
  onCopy: (value: string) => {
    return value;
  },
  onPaste: (value: string) => {
    return { accept: true, value };
  },
});

export default TableCellOther;
