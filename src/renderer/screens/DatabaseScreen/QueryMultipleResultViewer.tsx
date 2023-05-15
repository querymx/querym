import { SqlStatementResult } from 'libs/SqlRunnerManager';
import WindowTab from 'renderer/components/WindowTab';
import QueryResultViewer from '../QueryResultViewer';
import { useState } from 'react';

interface QueryMultipleResultViewerProps {
  value: SqlStatementResult[];
}

export default function QueryMultipleResultViewer({
  value,
}: QueryMultipleResultViewerProps) {
  const [selected, setSelected] = useState(`query_0`);

  if (value.length === 0) return <div />;
  if (value.length === 1) return <QueryResultViewer result={value[0].result} />;

  return (
    <WindowTab
      selected={selected}
      onTabChanged={(tab) => setSelected(tab.key)}
      tabs={value.map((result, idx) => {
        return {
          component: <QueryResultViewer result={result.result} />,
          key: `query_${idx}`,
          name: `Query ${idx + 1}`,
        };
      })}
    />
  );
}
