import { useCallback, useState, useEffect } from 'react';
import applyQueryResultChanges from 'libs/ApplyQueryResultChanges';
import generateSqlFromChanges from 'libs/GenerateSqlFromChanges';
import generateSqlFromPlan from 'libs/GenerateSqlFromPlan';
import Button from 'renderer/components/Button';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { QueryResult } from 'types/SqlResult';
import styles from './styles.module.scss';
import ButtonGroup from 'renderer/components/ButtonGroup';
import ExportModal from '../ExportModal';
import { useDialog } from 'renderer/contexts/DialogProvider';

interface QueryResultActionProps {
  result: QueryResult;
  onResultChange: React.Dispatch<React.SetStateAction<QueryResult>>;
  onRequestRefetch: () => void;
  page: number;
  pageSize: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
}

export default function QueryResultAction({
  result,
  onResultChange,
  onRequestRefetch,
  page,
  pageSize,
  onPageChange,
}: QueryResultActionProps) {
  const { showErrorDialog } = useDialog();
  const [changeCount, setChangeCount] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const { clearChange, collector } = useQueryResultChange();
  const { schema, currentDatabase } = useSchema();
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

        console.log(plans);
        const rawSql = plans.map((plan) => ({
          sql: generateSqlFromPlan(plan),
        }));

        runner
          .execute(rawSql, { insideTransaction: true })
          .then(() => {
            const changes = collector.getChanges();

            if (changes.new.length === 0 && changes.remove.length === 0) {
              onResultChange((prev) => {
                clearChange();
                return applyQueryResultChanges(prev, changes.changes);
              });
            } else {
              onRequestRefetch();
            }
          })
          .catch((e) => {
            if (e.message) {
              showErrorDialog(e.message);
            }
          });
      }
    }
  }, [
    collector,
    schema,
    currentDatabase,
    clearChange,
    onResultChange,
    onRequestRefetch,
  ]);

  return (
    <div className={styles.footer}>
      {showExportModal && (
        <ExportModal data={result} onClose={() => setShowExportModal(false)} />
      )}

      <div className={styles.footerAction}>
        <ButtonGroup>
          <Button primary={!!changeCount} onClick={onCommit}>
            {changeCount ? `Commit (${changeCount})` : 'Commit'}
          </Button>
          <Button primary onClick={() => setShowExportModal(true)}>
            Export
          </Button>
        </ButtonGroup>
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
