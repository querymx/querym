import React, { useCallback, useState } from 'react';
import { QueryResultChangeProvider } from 'renderer/contexts/QueryResultChangeProvider';
import QueryResultTable from './QueryResultTable';
import styles from './styles.module.scss';
import { TableCellManagerProvider } from './TableCellManager';
import QueryResultAction from './QueryResultAction';
import { QueryResult } from 'types/SqlResult';
import { SqlStatement } from 'types/SqlStatement';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { transformResultHeaderUseSchema } from 'libs/TransformResult';
import { useSchema } from 'renderer/contexts/SchemaProvider';

function QueryResultViewer({
  result,
  statement,
}: {
  result: QueryResult;
  statement: SqlStatement;
}) {
  const { runner } = useSqlExecute();
  // This is use remount the component
  const { schema } = useSchema();
  const [runningIndex, setRunningIndex] = useState(0);
  const [cacheResult, setCacheResult] = useState(result);
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

  return (
    <QueryResultChangeProvider key={runningIndex.toString()}>
      <div className={styles.result}>
        <TableCellManagerProvider>
          <QueryResultTable
            result={cacheResult}
            page={page}
            pageSize={pageSize}
          />
          <QueryResultAction
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            result={cacheResult}
            onResultChange={setCacheResult}
            onRequestRefetch={onRequestRefetch}
          />
        </TableCellManagerProvider>
      </div>
    </QueryResultChangeProvider>
  );
}

export default React.memo(QueryResultViewer);
