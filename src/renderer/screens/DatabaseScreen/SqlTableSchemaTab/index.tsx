import { useEffect } from 'react';
import { useWindowTab } from 'renderer/contexts/WindowTabProvider';

interface SqlTableSchemaProps {
  name: string;
  tabKey: string;
  database: string;
  table: string;
}

export default function SqlTableSchemaTab({
  tabKey,
  database,
  table,
}: SqlTableSchemaProps) {
  const { setTabData } = useWindowTab();

  useEffect(() => {
    setTabData(tabKey, { type: 'table-schema', database, table });
  }, [tabKey, setTabData, database, table]);

  return (
    <div>
      <h1>
        {database}.{table}
      </h1>
    </div>
  );
}
