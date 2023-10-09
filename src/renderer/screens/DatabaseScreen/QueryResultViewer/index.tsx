import React, { useCallback, useState, useMemo } from 'react';
import QueryResultTable, {
  QuertResultTableSortedHeader,
} from './QueryResultTable';
import styles from './styles.module.scss';
import QueryResultAction from './QueryResultAction';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import { SqlStatementResult } from 'libs/SqlRunnerManager';
import { EditableQueryResultProvider } from 'renderer/contexts/EditableQueryResultProvider';
import { QueryTypedResult } from 'types/SqlResult';

function QueryResultViewer({
  statementResult,
}: {
  statementResult: SqlStatementResult<QueryTypedResult>;
}) {
  const { statement, result } = statementResult;
  const { runner, common } = useSqlExecute();
  const { schema } = useSchema();
  const [runningIndex, setRunningIndex] = useState(0);
  const [cacheResult, setCacheResult] = useState(result);
  const [sortedHeader, setSortedHeader] =
    useState<QuertResultTableSortedHeader>();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 1000;

  const onRequestRefetch = useCallback(() => {
    runner
      .execute([statement])
      .then((result) => {
        setCacheResult(common.attachHeaders(result, schema)[0].result);
        setRunningIndex((prev) => prev + 1);
      })
      .catch(console.error);
  }, [statement, runner, setCacheResult, setRunningIndex, common]);

  const onSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(0);
    },
    [setSearch, setPage],
  );

  const resultWithIndex = useMemo(() => {
    let rows = cacheResult.rows.map((value, rowIndex) => {
      return {
        rowIndex: rowIndex + page * pageSize,
        data: value,
      };
    });

    if (search) {
      const searchValue = search.toLowerCase();
      rows = rows.filter((row) => {
        const values = Object.values(row.data);
        for (const value of values) {
          if (value.matched(searchValue)) return true;
        }
        return false;
      });
    }

    if (sortedHeader) {
      rows.sort((a, b) => {
        return a.data[sortedHeader.header.name].compare(
          b.data[sortedHeader.header.name],
        );
      });

      if (sortedHeader.by === 'DESC') rows.reverse();
    }

    return rows;
  }, [page, cacheResult, search, sortedHeader]);

  const slicedResult = useMemo(() => {
    return resultWithIndex.slice(page * pageSize, (page + 1) * pageSize);
  }, [resultWithIndex]);

  return (
    <EditableQueryResultProvider key={runningIndex.toString()}>
      <div className={styles.result}>
        <QueryResultTable
          headers={result.headers}
          result={slicedResult}
          sortedHeader={sortedHeader}
          onSortHeader={setSortedHeader}
          onSortReset={() => {
            setSortedHeader(undefined);
          }}
        />
        <QueryResultAction
          page={page}
          pageSize={pageSize}
          onSearchChange={onSearchChange}
          onPageChange={setPage}
          result={cacheResult}
          resultAfterFilter={resultWithIndex}
          onResultChange={setCacheResult}
          onRequestRefetch={onRequestRefetch}
          time={statementResult.time}
        />
      </div>
    </EditableQueryResultProvider>
  );
}

export default React.memo(QueryResultViewer);
