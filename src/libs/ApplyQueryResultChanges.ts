import { QueryRowBasedResult } from 'types/SqlResult';
import { ResultChangeCollectorItem } from './ResultChangeCollector';

export default function applyQueryResultChanges(
  result: QueryRowBasedResult,
  changes: ResultChangeCollectorItem[]
): QueryRowBasedResult {
  const newResult = { ...result };

  for (const change of changes) {
    for (const col of change.cols) {
      newResult.rows[change.row][col.col] = col.value;
    }
  }

  return newResult;
}
