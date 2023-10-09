import { qb } from 'libs/QueryBuilder';
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  SetStateAction,
  Dispatch,
} from 'react';
import QueryResultTable, {
  QuertResultTableSortedHeader,
} from '../QueryResultViewer/QueryResultTable';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { QueryResult, QueryResultWithIndex } from 'types/SqlResult';
import Layout from 'renderer/components/Layout';
import Toolbar from 'renderer/components/Toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { EditableQueryResultProvider } from 'renderer/contexts/EditableQueryResultProvider';
import QueryResultLoading from '../QueryResultViewer/QueryResultLoading';
import { useDialog } from 'renderer/contexts/DialogProvider';
import CommitChangeToolbarItem from '../QueryResultViewer/CommitChangeToolbarItem';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import BaseType from 'renderer/datatype/BaseType';

interface TableDataViewerProps {
  databaseName: string;
  tableName: string;
  tabKey: string;
  name: string;
}

const PAGE_SIZE = 200;

function TableDataViewerBody({
  result,
  setResult,
  totalRows,
  page,
  refresh,
  sortedHeader,
  setSortedHeader,
  setPage,
}: {
  result: QueryResult<Record<string, BaseType>>;
  setResult: Dispatch<SetStateAction<QueryResult<Record<string, BaseType>>>>;
  totalRows: number | null;
  page: number;
  refresh: () => void;
  sortedHeader?: QuertResultTableSortedHeader;
  setSortedHeader: React.Dispatch<
    React.SetStateAction<QuertResultTableSortedHeader | undefined>
  >;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const data = useMemo<QueryResultWithIndex<BaseType>[]>(
    () =>
      result.rows.map((row, idx) => ({
        rowIndex: idx,
        data: row,
      })),
    [result],
  );

  const headers = result.headers;
  const rowRange = {
    start: page * PAGE_SIZE,
    end: page * PAGE_SIZE + result.rows.length,
  };

  const onNextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, [setPage]);

  const onPrevPage = useCallback(() => {
    setPage((prev) => prev - 1);
  }, [setPage]);

  const footer = (
    <Toolbar shadowTop>
      {result && (
        <CommitChangeToolbarItem
          result={result}
          onResultChange={setResult}
          onRequestRefetch={refresh}
        />
      )}
      <Toolbar.Item
        icon={<FontAwesomeIcon icon={faRefresh} color="#27ae60" />}
        text="Refresh"
        onClick={() => refresh()}
      />
      <Toolbar.Filler />
      <Toolbar.Item
        icon={<FontAwesomeIcon icon={faChevronLeft} />}
        disabled={page === 0}
        onClick={onPrevPage}
      />
      <Toolbar.Text>
        {rowRange.start}-{rowRange.end}/
        {totalRows === null
          ? 'unknown'
          : totalRows.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </Toolbar.Text>
      <Toolbar.Item
        disabled={data.length === 0}
        icon={<FontAwesomeIcon icon={faChevronRight} />}
        onClick={onNextPage}
      />
    </Toolbar>
  );

  return (
    <EditableQueryResultProvider>
      <Layout>
        <Layout.Grow>
          <div style={{ width: '100%', height: '100%', display: 'flex' }}>
            <QueryResultTable
              headers={headers}
              result={data}
              onSortHeader={setSortedHeader}
              onSortReset={() => setSortedHeader(undefined)}
              sortedHeader={sortedHeader}
            />
          </div>
        </Layout.Grow>
        <Layout.Fixed>{footer}</Layout.Fixed>
      </Layout>
    </EditableQueryResultProvider>
  );
}

export default function TableDataViewer({
  databaseName,
  tableName,
}: TableDataViewerProps) {
  const { schema, dialect } = useSchema();
  const { runner, common } = useSqlExecute();
  const [result, setResult] = useState<QueryResult<Record<string, BaseType>>>();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [totalRows, setTotalRows] = useState<number | null>(null);
  const { showErrorDialog } = useDialog();
  const [loading, setLoading] = useState(true);
  const [sortedHeader, setSortedHeader] =
    useState<QuertResultTableSortedHeader>();
  const [page, setPage] = useState(0);

  useEffect(() => {
    common.estimateTableRowCount(databaseName, tableName).then(setTotalRows);
  }, [databaseName, tableName, setTotalRows]);

  useEffect(() => {
    const builder = qb(dialect)
      .table(`${databaseName}.${tableName}`)
      .select()
      .offset(PAGE_SIZE * page)
      .limit(PAGE_SIZE);

    if (sortedHeader) {
      builder.orderBy(sortedHeader.header.name, sortedHeader.by);
    }

    const selectSql = builder.toRawSQL();

    setLoading(true);
    runner
      .execute([{ sql: selectSql }], {
        skipProtection: true,
      })
      .then((result) => {
        const transformResult = common.attachHeaders(result, schema);
        setResult(transformResult[0].result);
        setLoading(false);
      })
      .catch((e) => {
        if (e.message) {
          showErrorDialog(e.message);
        }
      });
  }, [
    dialect,
    runner,
    page,
    sortedHeader,
    setTotalRows,
    setLoading,
    setResult,
    refreshCounter,
    common,
  ]);

  if (loading || !result) {
    return (
      <Layout>
        <Layout.Grow></Layout.Grow>
        <Layout.Fixed>
          <QueryResultLoading />
        </Layout.Fixed>
      </Layout>
    );
  }

  return (
    <TableDataViewerBody
      result={result}
      setResult={
        setResult as Dispatch<
          SetStateAction<QueryResult<Record<string, BaseType>>>
        >
      }
      totalRows={totalRows}
      page={page}
      setPage={setPage}
      // This will cause the code to refresh the result
      refresh={() => setRefreshCounter((prev) => prev + 1)}
      // Handle sorting
      sortedHeader={sortedHeader}
      setSortedHeader={setSortedHeader}
    />
  );
}
