import {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './styles.module.scss';

interface ResizableTableProps {
  headers: { name: string; icon?: ReactElement }[];
}

function ResizeHandler({ idx }: { idx: number }) {
  const handlerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (handlerRef.current && resizing) {
      const table = handlerRef.current?.parentNode?.parentNode?.parentNode
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

export default function ResizableTable({
  headers,
  children,
}: PropsWithChildren<ResizableTableProps>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isGridCSSPrepared, setGridCSSPrepared] = useState(false);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.style.gridTemplateColumns =
        headers.map(() => '150px').join(' ') || '';
      setGridCSSPrepared(true);
    }
  }, [headers, tableRef, setGridCSSPrepared]);

  return (
    <table ref={tableRef} className={styles.table}>
      {isGridCSSPrepared && (
        <>
          <thead>
            <tr>
              {headers.map((header, idx) => (
                <th key={header.name}>
                  <div className={styles.headerContent}>
                    <div className={styles.headerContentTitle}>
                      {header.name}
                    </div>
                    {header.icon && (
                      <div className={styles.headerContentIcon}>
                        header.icon
                      </div>
                    )}
                  </div>
                  <ResizeHandler idx={idx} />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>{children}</tbody>
        </>
      )}
    </table>
  );
}
