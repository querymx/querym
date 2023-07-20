import React, { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import TableCell from 'renderer/screens/DatabaseScreen/QueryResultViewer/TableCell/TableCell';
import { QueryResultHeader, QueryRowBasedResult } from 'types/SqlResult';
import { getUpdatableTable } from 'libs/GenerateSqlFromChanges';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';
import { useTableCellManager } from './TableCellManager';
import OptimizeTable from 'renderer/components/OptimizeTable';
import Icon from 'renderer/components/Icon';

interface QueryResultTableProps {
  result: QueryRowBasedResult;
  page: number;
  pageSize: number;
}

function QueryResultTable({ result, page, pageSize }: QueryResultTableProps) {
  const { collector } = useQueryResultChange();
  const { cellManager } = useTableCellManager();
  const { schema, currentDatabase } = useSchmea();
  const [selectedRowsIndex, setSelectedRowsIndex] = useState<number[]>([]);

  const handleSelectedRowsChange = (selectedRows: number[]) => {
    setSelectedRowsIndex(selectedRows);
  };

  const { handleContextMenu } = useContextMenu(() => {
    const selectedCell = cellManager.getFocusCell();

    return [
      {
        text: 'Insert NULL',
        disabled: !selectedCell,
        onClick: () => selectedCell?.insert(null),
      },
      {
        text: '',
        disabled: true,
        separator: true,
      },
      {
        text: 'Copy',
        hotkey: 'Ctrl + C',
        disabled: !selectedCell,
        onClick: () => selectedCell?.copy(),
      },
      {
        text: 'Paste',
        hotkey: 'Ctrl + V',
        disabled: !selectedCell,
        onClick: () => selectedCell?.paste(),
      },
      {
        text: '',
        disabled: true,
        separator: true,
      },
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

  const data = useMemo(() => {
    return result.rows.slice(page * pageSize, (page + 1) * pageSize);
  }, [page, pageSize, result.rows]);

  const updatableTables = useMemo(() => {
    if (result?.headers && currentDatabase && schema) {
      return getUpdatableTable(result?.headers, schema[currentDatabase]);
    }
    return {};
  }, [result, schema, currentDatabase]);

  if (!result?.headers || !result?.rows) {
    return <div>No result</div>;
  }

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
      resizable: true,
      icon: header?.schema?.primaryKey ? (
        <Icon.GreenKey size="sm" />
      ) : undefined,
      initialSize: Math.max(
        header.name.length * 10,
        getInitialSizeByHeaderType(idx, header)
      ),
    }));
  }, [result]);

  const renderCell = useCallback(
    (y: number, x: number) => {
      return (
        <TableCell
          key={(y + page * pageSize).toString() + '_' + x}
          value={data[y][x]}
          header={result.headers[x]}
          col={x}
          row={y + page * pageSize}
          readOnly={!updatableTables[result.headers[x]?.schema?.table || '']}
        />
      );
    },
    [data, updatableTables, page, pageSize]
  );

  return (
    <div className={styles.container} onContextMenu={handleContextMenu}>
      <OptimizeTable
        headers={headerMemo}
        data={data}
        renderAhead={20}
        renderCell={renderCell}
        rowHeight={35}
        selectedRowsIndex={selectedRowsIndex}
        onSelectedRowsIndexChanged={handleSelectedRowsChange}
      />
    </div>
  );
}

export default React.memo(QueryResultTable);
