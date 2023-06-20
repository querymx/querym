import React, { useMemo } from 'react';
import styles from './styles.module.scss';
import TableCell from 'renderer/screens/DatabaseScreen/QueryResultViewer/TableCell/TableCell';
import Icon from 'renderer/components/Icon';
import { QueryResult } from 'types/SqlResult';
import { getUpdatableTable } from 'libs/GenerateSqlFromChanges';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';
import { useTableCellManager } from './TableCellManager';
import ResizableTable from 'renderer/components/ResizableTable';

interface QueryResultTableProps {
  result: QueryResult;
  page: number;
  pageSize: number;
}

function QueryResultTable({ result, page, pageSize }: QueryResultTableProps) {
  const { collector } = useQueryResultChange();
  const { cellManager } = useTableCellManager();
  const { schema, currentDatabase } = useSchmea();

  const { handleContextMenu } = useContextMenu(() => {
    return [
      {
        text: `Discard Changes`,
        destructive: true,
        disabled: !collector.getChangesCount(),
        onClick: () => {
          const rows = collector.getChanges();
          for (const row of rows) {
            for (const col of row.cols) {
              const cell = cellManager.get(row.row, col.col);
              if (cell) {
                cell.discard();
              }
            }
          }
        },
      },
    ];
  }, [collector]);

  const updatableTables = useMemo(() => {
    if (result?.headers && currentDatabase && schema) {
      return getUpdatableTable(result?.headers, schema[currentDatabase]);
    }
    return {};
  }, [result, schema, currentDatabase]);

  if (!result?.headers || !result?.rows) {
    return <div>No result</div>;
  }

  const RowList = useMemo(() => {
    const list = [];
    const start = page * pageSize;
    const end = Math.min(result.rows.length, start + pageSize);

    for (let i = start; i < end; i++) {
      const row = result.rows[i];
      list.push(
        <tr key={i}>
          {row.map((cell, cellIdx) => (
            <td key={cellIdx}>
              <TableCell
                value={cell}
                header={result.headers[cellIdx]}
                col={cellIdx}
                row={i}
                readOnly={
                  !updatableTables[result.headers[cellIdx]?.schema?.table || '']
                }
              />
            </td>
          ))}
        </tr>
      );
    }

    return list;
  }, [result, page, pageSize]);

  return (
    <div
      className={`${styles.container} scroll`}
      onContextMenu={handleContextMenu}
    >
      <ResizableTable
        headers={result.headers.map((header) => ({
          name: header.name || '',
          icon: header?.schema?.primaryKey ? <Icon.GreenKey /> : undefined,
        }))}
      >
        {RowList}
      </ResizableTable>
    </div>
  );
}

export default React.memo(QueryResultTable);
