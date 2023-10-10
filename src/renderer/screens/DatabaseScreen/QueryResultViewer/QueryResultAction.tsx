import { useState } from 'react';
import { QueryTypedResult } from 'types/SqlResult';
import styles from './styles.module.scss';
import ExportModal from '../ExportModal';
import Toolbar from 'renderer/components/Toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { useDebounceEffect } from 'renderer/hooks/useDebounce';
import CommitChangeToolbarItem from './CommitChangeToolbarItem';
import BaseType from 'renderer/datatype/BaseType';

interface QueryResultActionProps {
  result: QueryTypedResult;
  resultAfterFilter: { data: Record<string, BaseType>; rowIndex: number }[];
  onResultChange: React.Dispatch<React.SetStateAction<QueryTypedResult>>;
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [search, setSearch] = useState('');

  const rowStart = page * pageSize;
  const rowEnd = Math.min(resultAfterFilter.length, rowStart + pageSize);

  useDebounceEffect(
    () => {
      onSearchChange(search);
    },
    [onSearchChange, search],
    1000,
  );

  return (
    <div className={styles.footer}>
      <Toolbar>
        <Toolbar.Text>Took {Math.round(time / 1000)}s</Toolbar.Text>
        <Toolbar.Separator />

        <CommitChangeToolbarItem
          onRequestRefetch={onRequestRefetch}
          onResultChange={onResultChange}
          result={result}
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
