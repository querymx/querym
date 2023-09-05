import ResizableTable from '../ResizableTable';
import { TableColumnsAlterDiff } from './TableColumnsAlterDiff';
import TableCellContent from '../ResizableTable/TableCellContent';
import CellSingleLineInput from '../OptimizeTable/CellSingleLineInput';
import CellCheckInput from '../OptimizeTable/CellCheckInput';
import CellGroupSelectInput from '../OptimizeTable/CellGroupSelectInput';

const MySQLGroupTypes = [
  {
    name: 'Integer',
    items: [
      { value: 'tinyint', text: 'TINYINT' },
      { value: 'smallint', text: 'SMALLINT' },
      { value: 'mediumint', text: 'MEDIUMINT' },
      { value: 'int', text: 'INT' },
      { value: 'bigint', text: 'BIGINT' },
      { value: 'bit', text: 'BIT' },
    ],
  },
  {
    name: 'Real',
    items: [
      { value: 'float', text: 'FLOAT' },
      { value: 'double', text: 'DOUBLE' },
      { value: 'decimal', text: 'DECIMAL' },
    ],
  },
];

export default function SchemaEditor({
  diff,
}: {
  diff: TableColumnsAlterDiff;
}) {
  const diffArray = diff.toArray();
  return (
    <ResizableTable
      headers={[
        { name: '#', initialSize: 40 },
        { name: 'Name' },
        { name: 'Type' },
        { name: 'Nullable', initialSize: 85 },
        { name: 'Default' },
      ]}
    >
      {diffArray.map((diff) => {
        return (
          <tr key={diff.index}>
            <td>
              <TableCellContent value={diff.index + 1} />
            </td>
            <td>
              <CellSingleLineInput
                value={diff.changed?.name ?? diff.original?.name}
              />
            </td>
            <td>
              <CellGroupSelectInput
                value={diff.changed?.dataType ?? diff.original?.dataType}
                items={MySQLGroupTypes}
              />
            </td>
            <td>
              <CellCheckInput />
            </td>
            <td></td>
          </tr>
        );
      })}
    </ResizableTable>
  );
}
