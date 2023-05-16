import { DatabaseSchemas } from 'drivers/SQLLikeConnection';
import React, { useState, PropsWithChildren, useContext } from 'react';
import { useDatabaseSetting } from './DatabaseSettingProvider';

const SchemaContext = React.createContext<{
  schema?: DatabaseSchemas;
  currentDatabase?: string;
  setCurrentDatabase: (v: string) => void;
}>({
  schema: {},
  setCurrentDatabase: () => {
    throw 'Not implemented';
  },
});

export function useSchmea() {
  return useContext(SchemaContext);
}

export function SchemaProvider({
  children,
  schema,
}: PropsWithChildren<{ schema?: DatabaseSchemas }>) {
  const { setting } = useDatabaseSetting();
  const [currentDatabase, setCurrentDatabase] = useState(
    setting?.config?.database
  );

  return (
    <SchemaContext.Provider
      value={{ schema: schema, currentDatabase, setCurrentDatabase }}
    >
      {children}
    </SchemaContext.Provider>
  );
}
