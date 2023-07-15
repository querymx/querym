import { SqlStatementRowBasedResult } from 'libs/SqlRunnerManager';
import WindowTab from 'renderer/components/WindowTab';
import QueryResultViewer from './QueryResultViewer';
import { useMemo, useState, memo } from 'react';

interface QueryMultipleResultViewerProps {
  value: SqlStatementRowBasedResult[];
}

export default memo(function QueryMultipleResultViewer({
  value,
}: QueryMultipleResultViewerProps) {
  const queryResultOnly = useMemo(() => {
    return value.filter((v) => !v.result.resultHeader);
  }, [value]);
  const [selected, setSelected] = useState(`query_0`);

  if (queryResultOnly.length === 0) return <div />;
  if (queryResultOnly.length === 1)
    return <QueryResultViewer result={value[0].result} />;

  return (
    <WindowTab
      selected={selected}
      onTabChanged={(tab) => setSelected(tab.key)}
      tabs={queryResultOnly.map((result, idx) => {
        return {
          component: <QueryResultViewer result={result.result} />,
          key: `query_${idx}`,
          name: `Query ${idx + 1}`,
        };
      })}
    />
  );
});
