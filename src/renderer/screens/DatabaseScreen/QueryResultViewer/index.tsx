import React, { useState } from 'react';
import { QueryResultChangeProvider } from 'renderer/contexts/QueryResultChangeProvider';
import QueryResultTable from './QueryResultTable';
import styles from './styles.module.scss';
import { QueryResult } from 'types/SqlResult';
import { TableCellManagerProvider } from './TableCellManager';
import QueryResultAction from './QueryResultAction';

function QueryResultViewer({ result }: { result: QueryResult }) {
  const [cacheResult, setCacheResult] = useState(result);

  return (
    <QueryResultChangeProvider>
      <div className={styles.result}>
        <TableCellManagerProvider>
          <QueryResultTable result={cacheResult} />
          <QueryResultAction
            result={cacheResult}
            onResultChange={setCacheResult}
          />
        </TableCellManagerProvider>
      </div>
    </QueryResultChangeProvider>
  );
}

export default React.memo(QueryResultViewer);
