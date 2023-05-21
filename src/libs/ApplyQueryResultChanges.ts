import { QueryResult } from 'types/SqlResult';
import { ResultChangeCollectorItem } from './ResultChangeCollector';

export default function applyQueryResultChanges(
  result: QueryResult,
  changes: ResultChangeCollectorItem[]
): QueryResult {
  const newResult = { ...result };

  for (const change of changes) {
    for (const col of change.cols) {
      newResult.rows[change.row][col.col] = col.value;
    }
  }

  return newResult;
}
