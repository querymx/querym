import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import TableCell from 'renderer/screens/DatabaseScreen/QueryResultViewer/TableCell/TableCell';
import Icon from 'renderer/components/Icon';
import { QueryResult } from 'types/SqlResult';
import { getUpdatableTable } from 'libs/GenerateSqlFromChanges';
import { useSchmea } from 'renderer/contexts/SchemaProvider';

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

function QueryResultTable({ result }: { result?: QueryResult | null }) {
  const tableRef = useRef<HTMLTableElement>(null);
  const { schema, currentDatabase } = useSchmea();

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

  return (
    <div className={styles.container}>
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

        <tbody>
          {result.rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx}>
                  <TableCell
                    value={cell}
                    header={result.headers[cellIdx]}
                    col={cellIdx}
                    row={idx}
                    readOnly={
                      !updatableTables[
                        result.headers[cellIdx]?.schema?.table || ''
                      ]
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(QueryResultTable);
