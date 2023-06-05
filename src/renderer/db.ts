import Dexie from 'dexie';

export const db = new Dexie('query-master');

db.version(1).stores({
  database_config: 'id',
  database_tabs: 'id',
});
