import React, { useCallback, useState, useMemo } from 'react';
import { QueryResultChangeProvider } from 'renderer/contexts/QueryResultChangeProvider';
import QueryResultTable from './QueryResultTable';
import styles from './styles.module.scss';
import { TableCellManagerProvider } from './TableCellManager';
import QueryResultAction from './QueryResultAction';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { transformResultHeaderUseSchema } from 'libs/TransformResult';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import { SqlStatementResult } from 'libs/SqlRunnerManager';

function QueryResultViewer({
  statementResult,
}: {
  statementResult: SqlStatementResult;
}) {
  const { statement, result } = statementResult;
  const { runner } = useSqlExecute();
  const { schema } = useSchema();
  const [runningIndex, setRunningIndex] = useState(0);
  const [cacheResult, setCacheResult] = useState(result);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 1000;

  const onRequestRefetch = useCallback(() => {
    runner
      .execute([statement])
      .then((result) => {
        setCacheResult(
          transformResultHeaderUseSchema(result, schema)[0].result
        );
        setRunningIndex((prev) => prev + 1);
      })
      .catch(console.error);
  }, [statement, runner, setCacheResult, setRunningIndex]);

  const onSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(0);
    },
    [setSearch, setPage]
  );

  const resultWithIndex = useMemo(() => {
    let slicedRows = result.rows
      .slice(page * pageSize, (page + 1) * pageSize)
      .map((value, rowIndex) => {
        return {
          rowIndex: rowIndex + page * pageSize,
          data: value,
        };
      });

    if (search) {
      const searchValue = search.toLowerCase();
      slicedRows = slicedRows.filter((row) => {
        const values = Object.values(row.data);
        for (const value of values) {
          if (typeof value === 'string' || typeof value === 'number') {
            const stringValue = value.toString().toLowerCase();
            if (stringValue.includes(searchValue)) return true;
          }
        }
        return false;
      });
    }

    return slicedRows;
  }, [page, result, search]);

  return (
    <QueryResultChangeProvider key={runningIndex.toString()}>
      <div className={styles.result}>
        <TableCellManagerProvider>
          <QueryResultTable
            headers={result.headers}
            result={resultWithIndex}
            page={page}
            pageSize={pageSize}
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
        </TableCellManagerProvider>
      </div>
    </QueryResultChangeProvider>
  );
}

export default React.memo(QueryResultViewer);
