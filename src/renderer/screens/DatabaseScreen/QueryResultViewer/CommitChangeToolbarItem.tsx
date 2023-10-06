import applyQueryResultChanges from 'libs/ApplyQueryResultChanges';
import generateSqlFromChanges from 'libs/GenerateSqlFromChanges';
import generateSqlFromPlan from 'libs/GenerateSqlFromPlan';
import { useCallback, useEffect, useState } from 'react';
import Toolbar from 'renderer/components/Toolbar';
import { useDialog } from 'renderer/contexts/DialogProvider';
import { useEditableResult } from 'renderer/contexts/EditableQueryResultProvider';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { QueryTypedResult } from 'types/SqlResult';

interface CommitChangeToolbarItemProps {
  result: QueryTypedResult;
  onResultChange: React.Dispatch<React.SetStateAction<QueryTypedResult>>;
  onRequestRefetch: () => void;
}

export default function CommitChangeToolbarItem({
  result,
  onResultChange,
  onRequestRefetch,
}: CommitChangeToolbarItemProps) {
  const { showErrorDialog } = useDialog();
  const [changeCount, setChangeCount] = useState(0);
  const { clearChange, collector } = useEditableResult();
  const { schema, currentDatabase, dialect } = useSchema();
  const { runner } = useSqlExecute();

  useEffect(() => {
    const cb = (count: number) => {
      setChangeCount(count);
    };

    collector.registerChange(cb);
    return () => collector.unregisterChange(cb);
  }, [collector, setChangeCount]);

  const onCommit = useCallback(() => {
    if (schema) {
      const currentDatabaseSchema = schema.getDatabase(currentDatabase || '');

      if (currentDatabaseSchema && result) {
        const plans = generateSqlFromChanges(
          currentDatabaseSchema,
          result,
          collector.getChanges(),
        );

        const rawSql = plans.map((plan) => ({
          sql: generateSqlFromPlan(dialect, plan),
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
    <Toolbar.Item
      text="Commit"
      badge={changeCount}
      onClick={onCommit}
      disabled={!changeCount}
    />
  );
}
