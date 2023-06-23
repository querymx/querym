import React, { useMemo } from 'react';
import styles from './styles.module.scss';
import TableCell from 'renderer/screens/DatabaseScreen/QueryResultViewer/TableCell/TableCell';
import Icon from 'renderer/components/Icon';
import { QueryResult, QueryResultHeader } from 'types/SqlResult';
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

  const headerMemo = useMemo(() => {
    function getInitialSizeByHeaderType(
      idx: number,
      header: QueryResultHeader
    ) {
      if (header.type.type === 'number') {
        return 100;
      } else if (
        header.type.type === 'string' ||
        header.type.type === 'decimal'
      ) {
        // Check the last 100 records
        const maxLength = Math.max(
          ...result.rows.slice(0, 100).map((row) => {
            if (typeof row[idx] === 'string')
              return (row[idx] as string).length;
            return 10;
          })
        );

        return Math.max(150, Math.min(500, maxLength * 8));
      }

      return 150;
    }

    return result.headers.map((header, idx) => ({
      name: header.name || '',
      icon: header?.schema?.primaryKey ? <Icon.GreenKey /> : undefined,
      initialSize: Math.max(
        header.name.length * 10,
        getInitialSizeByHeaderType(idx, header)
      ),
    }));
  }, [result]);

  return (
    <div
      className={`${styles.container} scroll`}
      onContextMenu={handleContextMenu}
    >
      <ResizableTable headers={headerMemo}>{RowList}</ResizableTable>
    </div>
  );
}

export default React.memo(QueryResultTable);
