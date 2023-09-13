import { qb } from 'libs/QueryBuilder';
import { useEffect, useState, useCallback } from 'react';
import { QueryResultChangeProvider } from 'renderer/contexts/QueryResultChangeProvider';
import QueryResultTable from '../QueryResultViewer/QueryResultTable';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { QueryResultHeader, QueryResultWithIndex } from 'types/SqlResult';
import { TableCellManagerProvider } from '../QueryResultViewer/TableCellManager';
import Layout from 'renderer/components/Layout';
import Toolbar from 'renderer/components/Toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

interface TableDataViewerProps {
  databaseName: string;
  tableName: string;
  tabKey: string;
  name: string;
}

const PAGE_SIZE = 200;

export default function TableDataViewer({
  databaseName,
  tableName,
}: TableDataViewerProps) {
  const { runner } = useSqlExecute();
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [data, setData] = useState<QueryResultWithIndex[]>([]);
  const [headers, setHeaders] = useState<QueryResultHeader[]>([]);

  const [rowRange, setRowRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });
  const [page, setPage] = useState(0);

  useEffect(() => {
    const c = qb();
    c.table(`${databaseName}.${tableName}`).select(c.raw('COUNT(*) AS total'));
    const countSql = c.toRawSQL();

    runner
      .execute([{ sql: countSql }], { skipProtection: true })
      .then((result) => {
        setTotalRows(Number(result[0].result.rows[0]['total'] ?? 0));
      })
      .catch();
  }, [databaseName, tableName, setTotalRows]);

  useEffect(() => {
    const selectSql = qb()
      .table(`${databaseName}.${tableName}`)
      .select()
      .offset(PAGE_SIZE * page)
      .limit(PAGE_SIZE)
      .toRawSQL();

    setLoading(true);
    runner
      .execute([{ sql: selectSql }], {
        skipProtection: true,
      })
      .then((result) => {
        setHeaders(result[0].result.headers);
        setData(
          result[0].result.rows.map((row, idx) => ({
            rowIndex: idx,
            data: row,
          }))
        );

        setLoading(false);
        setRowRange({
          start: page * PAGE_SIZE,
          end: page * PAGE_SIZE + result[0].result.rows.length,
        });
      })
      .catch();
  }, [runner, page, setHeaders, setData, setTotalRows, setLoading]);

  const onNextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, [setPage]);

  const onPrevPage = useCallback(() => {
    setPage((prev) => prev - 1);
  }, [setPage]);

  return (
    <Layout>
      <Layout.Grow>
        <div style={{ width: '100%', height: '100%', display: 'flex' }}>
          {!loading && (
            <QueryResultChangeProvider>
              <TableCellManagerProvider>
                <QueryResultTable headers={headers} result={data} />
              </TableCellManagerProvider>
            </QueryResultChangeProvider>
          )}
        </div>
      </Layout.Grow>
      <Layout.Fixed>
        <Toolbar shadowTop>
          <Toolbar.Filler />
          <Toolbar.Item
            icon={<FontAwesomeIcon icon={faChevronLeft} />}
            disabled={page === 0}
            onClick={onPrevPage}
          />
          <Toolbar.Text>
            {rowRange.start}-{rowRange.end}/
            {totalRows.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Toolbar.Text>
          <Toolbar.Item
            disabled={PAGE_SIZE * (page + 1) >= totalRows}
            icon={<FontAwesomeIcon icon={faChevronRight} />}
            onClick={onNextPage}
          />
        </Toolbar>
      </Layout.Fixed>
    </Layout>
  );
}
