import React, { useState } from 'react';
import { QueryResultChangeProvider } from 'renderer/contexts/QueryResultChangeProvider';
import QueryResultTable from './QueryResultTable';
import styles from './styles.module.scss';
import { QueryRowBasedResult } from 'types/SqlResult';
import { TableCellManagerProvider } from './TableCellManager';
import QueryResultAction from './QueryResultAction';

function QueryResultViewer({ result }: { result: QueryRowBasedResult }) {
  const [cacheResult, setCacheResult] = useState(result);
  const [page, setPage] = useState(0);
  const pageSize = 1000;

  return (
    <QueryResultChangeProvider>
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
          />
        </TableCellManagerProvider>
      </div>
    </QueryResultChangeProvider>
  );
}

export default React.memo(QueryResultViewer);
