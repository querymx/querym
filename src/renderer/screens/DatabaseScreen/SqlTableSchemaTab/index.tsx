import { useEffect, useState } from 'react';
import ResizableTable from 'renderer/components/ResizableTable';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';
import { TableDefinitionSchema } from 'types/SqlSchema';

interface SqlTableSchemaProps {
  name: string;
  tabKey: string;
  database: string;
  table: string;
}

export default function SqlTableSchemaTab({
  tabKey,
  database,
  table,
}: SqlTableSchemaProps) {
  const { setTabData } = useWindowTab();
  const { common } = useSqlExecute();
  const [definition, setDefinition] = useState<TableDefinitionSchema | null>(
    null
  );

  useEffect(() => {
    common.getTableSchema(database, table).then(setDefinition).catch();
  }, [database, common]);

  useEffect(() => {
    setTabData(tabKey, { type: 'table-schema', database, table });
  }, [tabKey, setTabData, database, table]);

  return (
    <div>
      <ResizableTable
        headers={[
          { name: '#' },
          { name: 'Name' },
          { name: 'Data Type' },
          { name: 'Length' },
          { name: 'Scale' },
          { name: 'Precision' },
          { name: 'Nullable' },
          { name: 'Default' },
          { name: 'Comment' },
        ]}
      >
        {(definition?.columns || []).map((col, idx) => {
          return (
            <tr key={col.name}>
              <td>
                <TableCellContent value={(idx + 1).toString()} />
              </td>
              <td>
                <TableCellContent value={col.name} />
              </td>
              <td>
                <TableCellContent value={col.dataType} />
              </td>
              <td>
                <TableCellContent value={col.charLength} />
              </td>
              <td>
                <TableCellContent value={col.numericScale} />
              </td>
              <td>
                <TableCellContent value={col.nuermicPrecision} />
              </td>
              <td>
                <TableCellContent value={col.nullable ? 'YES' : 'NO'} />
              </td>
              <td>
                <TableCellContent value={col.default} />
              </td>
              <td>
                <TableCellContent value={col.comment || ''} />
              </td>
            </tr>
          );
        })}
      </ResizableTable>
    </div>
  );
}
