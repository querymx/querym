import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import TableCell from 'renderer/screens/DatabaseScreen/QueryResultViewer/TableCell/TableCell';
import Icon from 'renderer/components/Icon';
import { QueryResult } from 'types/SqlResult';
import { getUpdatableTable } from 'libs/GenerateSqlFromChanges';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';
import { useTableCellManager } from './TableCellManager';

interface QueryResultTableProps {
  result: QueryResult;
  page: number;
  pageSize: number;
}

function ResizeHandler({ idx }: { idx: number }) {
  const handlerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (handlerRef.current && resizing) {
      const table = handlerRef.current?.parentNode?.parentNode
        ?.parentNode as HTMLTableElement;

      if (table) {
        const onMouseMove = (e: MouseEvent) =>
          requestAnimationFrame(() => {
            const scrollOffset = table.scrollLeft;
            const width =
              scrollOffset +
              e.clientX -
              ((
                handlerRef.current?.parentNode as HTMLTableCellElement
              ).getBoundingClientRect().x || 0);

            if (table) {
              const columns = table.style.gridTemplateColumns.split(' ');
              columns[idx] = width + 'px';
              table.style.gridTemplateColumns = columns.join(' ');
            }
          });

        const onMouseUp = () => {
          setResizing(false);
        };

        table.addEventListener('mousemove', onMouseMove);
        table.addEventListener('mouseup', onMouseUp);

        return () => {
          table.removeEventListener('mousemove', onMouseMove);
          table.removeEventListener('mouseup', onMouseUp);
        };
      }
    }
  }, [handlerRef, idx, resizing, setResizing]);

  return (
    <div
      className={styles.handler}
      ref={handlerRef}
      onMouseDown={() => setResizing(true)}
    ></div>
  );
}

function QueryResultTable({ result, page, pageSize }: QueryResultTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
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

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.style.gridTemplateColumns =
        result?.headers.map(() => '150px').join(' ') || '';
    }
  }, [result, tableRef]);

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
    <div className={styles.container} onContextMenu={handleContextMenu}>
      <table ref={tableRef} className={styles.table}>
        <thead>
          {result.headers.map((header, idx) => (
            <th key={header.name}>
              <div className={styles.headerContent}>
                <div className={styles.headerContentTitle}>{header.name}</div>
                {!!header?.schema?.primaryKey && (
                  <div className={styles.headerContentIcon}>
                    <Icon.GreenKey />
                  </div>
                )}
              </div>
              <ResizeHandler idx={idx} />
            </th>
          ))}
        </thead>

        <tbody>{RowList}</tbody>
      </table>
    </div>
  );
}

export default React.memo(QueryResultTable);
