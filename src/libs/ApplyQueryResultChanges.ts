import { QueryResult } from 'types/SqlResult';
import { ResultChangeCollectorItem } from './ResultChangeCollector';

export default function applyQueryResultChanges(
  result: QueryResult,
  changes: ResultChangeCollectorItem[]
): QueryResult {
  const newResult = { ...result };
  const headers = result.headers;

  for (const change of changes) {
    for (const col of change.cols) {
      newResult.rows[change.row][headers[col.col].name] = col.value;
    }
  }

  return newResult;
}
