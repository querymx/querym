import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from 'renderer/db';
import { ConnectionConfigTree } from 'drivers/SQLLikeConnection';

export function useIndexDbConnection() {
  const [connections, setInternalConnections] =
    useState<ConnectionConfigTree[]>();

  const initialCollapsed = useMemo<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('db_collapsed_keys') || '[]');
    } catch {
      return [];
    }
  }, []);

  const saveCollapsed = useCallback((keys: string[]) => {
    localStorage.setItem('db_collapsed_keys', JSON.stringify(keys));
  }, []);

  useEffect(() => {
    db.table<{ name: string; value: ConnectionConfigTree[] }>('setting')
      .get('connections')
      .then((connections) => {
        if (connections) {
          setInternalConnections(connections.value);
        }
      });
  }, [setInternalConnections]);

  const setConnections = useCallback(
    (value: ConnectionConfigTree[]) => {
      db.table('setting').put({ name: 'connections', value });
      setInternalConnections(value);
    },
    [setInternalConnections]
  );

  return { connections, setConnections, initialCollapsed, saveCollapsed };
}
