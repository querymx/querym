import React, { useState, PropsWithChildren, useContext, useMemo } from 'react';
import { useDatabaseSetting } from './DatabaseSettingProvider';
import { DatabaseSchemas } from 'types/SqlSchema';
import NotImplementCallback from 'libs/NotImplementCallback';

const SchemaContext = React.createContext<{
  schema?: DatabaseSchemas;
  currentDatabase?: string;
  setCurrentDatabase: (v: string) => void;
  reloadSchema: () => void;
}>({
  schema: {},
  setCurrentDatabase: NotImplementCallback,
  reloadSchema: NotImplementCallback,
});

export function useSchema() {
  return useContext(SchemaContext);
}

export function SchemaProvider({
  children,
  schema,
  reloadSchema,
}: PropsWithChildren<{ schema?: DatabaseSchemas; reloadSchema: () => void }>) {
  const { setting } = useDatabaseSetting();
  const [currentDatabase, setCurrentDatabase] = useState(
    setting?.config?.database
  );

  const providerValuesMemo = useMemo(
    () => ({
      schema,
      currentDatabase,
      setCurrentDatabase,
      reloadSchema,
    }),
    [schema, currentDatabase, setCurrentDatabase, reloadSchema]
  );

  return (
    <SchemaContext.Provider value={providerValuesMemo}>
      {children}
    </SchemaContext.Provider>
  );
}
