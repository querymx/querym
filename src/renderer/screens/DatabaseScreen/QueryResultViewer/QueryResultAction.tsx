import { useCallback, useState, useEffect } from 'react';
import applyQueryResultChanges from 'libs/ApplyQueryResultChanges';
import generateSqlFromChanges from 'libs/GenerateSqlFromChanges';
import generateSqlFromPlan from 'libs/GenerateSqlFromPlan';
import { SqlProtectionLevel } from 'libs/SqlRunnerManager';
import Button from 'renderer/components/Button';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';
import { useSchmea } from 'renderer/contexts/SchemaProvider';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { QueryResult } from 'types/SqlResult';
import styles from './styles.module.scss';

interface QueryResultActionProps {
  result: QueryResult;
  onResultChange: React.Dispatch<React.SetStateAction<QueryResult>>;
  page: number;
  pageSize: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
}

export default function QueryResultAction({
  result,
  onResultChange,
  page,
  pageSize,
  onPageChange,
}: QueryResultActionProps) {
  const [changeCount, setChangeCount] = useState(0);
  const { clearChange, collector } = useQueryResultChange();
  const { schema, currentDatabase } = useSchmea();
  const { runner } = useSqlExecute();

  const rowStart = page * pageSize;
  const rowEnd = Math.min(result.rows.length, rowStart + pageSize);

  useEffect(() => {
    const cb = (count: number) => {
      setChangeCount(count);
    };

    collector.registerChange(cb);
    return () => collector.unregisterChange(cb);
  }, [collector, setChangeCount]);

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
            onResultChange((prev) => {
              const changes = collector.getChanges();
              clearChange();
              return applyQueryResultChanges(prev, changes);
            });
          })
          .catch(console.error);
      }
    }
  }, [collector, schema, currentDatabase, clearChange, onResultChange]);

  return (
    <div className={styles.footer}>
      <div className={styles.footerAction}>
        <Button primary={!!changeCount} onClick={onCommit}>
          {changeCount ? `Commit (${changeCount})` : 'Commit'}
        </Button>
      </div>

      <div className={styles.footerPage}>
        <Button
          disabled={page === 0}
          primary
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        <div>
          &nbsp;&nbsp;{rowStart}-{rowEnd} / {result.rows.length}&nbsp;&nbsp;
        </div>
        <Button
          primary
          disabled={rowStart + pageSize >= result.rows.length}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
