import { useCallback, useState, useEffect } from 'react';
import applyQueryResultChanges from 'libs/ApplyQueryResultChanges';
import generateSqlFromChanges from 'libs/GenerateSqlFromChanges';
import generateSqlFromPlan from 'libs/GenerateSqlFromPlan';
import { useQueryResultChange } from 'renderer/contexts/QueryResultChangeProvider';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { QueryResult } from 'types/SqlResult';
import styles from './styles.module.scss';
import ExportModal from '../ExportModal';
import { useDialog } from 'renderer/contexts/DialogProvider';
import Toolbar from 'renderer/components/Toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { useDebounceEffect } from 'hooks/useDebounce';

interface QueryResultActionProps {
  result: QueryResult;
  resultAfterFilter: { data: Record<string, unknown>; rowIndex: number }[];
  onResultChange: React.Dispatch<React.SetStateAction<QueryResult>>;
  onSearchChange: (v: string) => void;
  onRequestRefetch: () => void;
  page: number;
  pageSize: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
  time: number;
}

export default function QueryResultAction({
  result,
  resultAfterFilter,
  onResultChange,
  onRequestRefetch,
  page,
  pageSize,
  onPageChange,
  onSearchChange,
  time,
}: QueryResultActionProps) {
  const { showErrorDialog } = useDialog();
  const [changeCount, setChangeCount] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const { clearChange, collector } = useQueryResultChange();
  const { schema, currentDatabase } = useSchema();
  const [search, setSearch] = useState('');
  const { runner } = useSqlExecute();

  const rowStart = page * pageSize;
  const rowEnd = Math.min(resultAfterFilter.length, rowStart + pageSize);

  useDebounceEffect(
    () => {
      onSearchChange(search);
    },
    [onSearchChange, search],
    1000
  );

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
      <Toolbar>
        <Toolbar.Text>Took {Math.round(time / 1000)}s</Toolbar.Text>
        <Toolbar.Separator />
        <Toolbar.Item
          text="Commit"
          badge={changeCount}
          onClick={onCommit}
          disabled={!changeCount}
        />
        <Toolbar.Item text="Export" onClick={() => setShowExportModal(true)} />

        <Toolbar.Separator />
        <Toolbar.TextField
          placeholder="Search here"
          value={search}
          onChange={setSearch}
        />
        <Toolbar.Filler />

        {/* Pagination */}
        <Toolbar.Item
          text=""
          icon={<FontAwesomeIcon icon={faChevronLeft} />}
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        />
        <Toolbar.Text>
          {rowStart}-{rowEnd} / {resultAfterFilter.length}
        </Toolbar.Text>
        <Toolbar.Item
          onClick={() => onPageChange(page + 1)}
          text=""
          icon={<FontAwesomeIcon icon={faChevronRight} />}
          disabled={rowStart + pageSize >= resultAfterFilter.length}
        />
      </Toolbar>

      {showExportModal && (
        <ExportModal data={result} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}
