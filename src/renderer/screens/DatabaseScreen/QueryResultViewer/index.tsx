import React, { useCallback, useState } from 'react';
import {
  QueryResultChangeProvider,
  useQueryResultChange,
} from 'renderer/contexts/QueryResultChangeProvider';
import QueryResultTable from './QueryResultTable';
import styles from './styles.module.scss';
import Button from 'renderer/components/Button';
import { QueryResult } from 'types/SqlResult';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import generateSqlFromChanges from 'libs/GenerateSqlFromChanges';
import generateSqlFromPlan from 'libs/GenerateSqlFromPlan';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { SqlProtectionLevel } from 'libs/SqlRunnerManager';
import applyQueryResultChanges from 'libs/ApplyQueryResultChanges';

function QueryResultBody({ result }: { result: QueryResult }) {
  const { changeCount, clearChange, collector } = useQueryResultChange();
  const [cacheResult, setCacheResult] = useState(result);
  const { schema, currentDatabase } = useSchmea();
  const { runner } = useSqlExecute();

  const onCommit = useCallback(() => {
    if (schema) {
      const currentDatabaseSchema = schema[currentDatabase || ''];

      if (currentDatabaseSchema && result) {
        const plans = generateSqlFromChanges(
          currentDatabaseSchema,
          result,
          collector.getChanges()
        );

        const rawSql = plans.map((plan) => ({
          sql: generateSqlFromPlan(plan),
        }));

        runner
          .execute(SqlProtectionLevel.NeedConfirm, rawSql)
          .then(() => {
            setCacheResult((prev) =>
              applyQueryResultChanges(prev, collector.getChanges())
            );
            clearChange();
          })
          .catch();
      }
    }
  }, [collector, schema, currentDatabase, clearChange]);

  return (
    <div className={styles.result}>
      <QueryResultTable result={cacheResult} />
      <div className={styles.footer}>
        <Button primary={!!changeCount} onClick={onCommit}>
          {changeCount ? `Commit (${changeCount})` : 'Commit'}
        </Button>
      </div>
    </div>
  );
}

function QueryResultViewer({ result }: { result?: QueryResult | null }) {
  return (
    <QueryResultChangeProvider>
      {result && <QueryResultBody result={result} />}
    </QueryResultChangeProvider>
  );
}

export default React.memo(QueryResultViewer);
