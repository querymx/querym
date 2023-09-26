import React, { useState, PropsWithChildren, useContext, useMemo } from 'react';
import { useDatabaseSetting } from './DatabaseSettingProvider';
import { DatabaseSchemas } from 'types/SqlSchema';
import NotImplementCallback from 'libs/NotImplementCallback';
import { QueryDialetType } from 'libs/QueryBuilder';

const SchemaContext = React.createContext<{
  schema?: DatabaseSchemas;
  currentDatabase?: string;
  dialect: QueryDialetType;
  setCurrentDatabase: (v: string) => void;
  reloadSchema: () => void;
}>({
  schema: new DatabaseSchemas(),
  setCurrentDatabase: NotImplementCallback,
  reloadSchema: NotImplementCallback,
  dialect: 'mysql',
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
    setting?.type === 'postgre' ? 'public' : setting?.config?.database
  );

  const providerValuesMemo = useMemo(
    () => ({
      schema,
      currentDatabase,
      setCurrentDatabase,
      reloadSchema,
      dialect: (setting?.type ?? 'mysql') as QueryDialetType,
    }),
    [schema, currentDatabase, setCurrentDatabase, reloadSchema, setting]
  );

  return (
    <SchemaContext.Provider value={providerValuesMemo}>
      {children}
    </SchemaContext.Provider>
  );
}
