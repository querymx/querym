import Dexie from 'dexie';

export const db = new Dexie('query-master');

db.version(1).stores({
  database_config: 'id',
  database_tabs: 'id',
});

db.version(2).stores({
  database_config: 'id',
  database_tabs: 'id',
  setting: 'name',
});

db.version(3).stores({
  database_config: 'id',
  database_tabs: 'id',
  saved_query: 'id',
  setting: 'name',
});

db.version(4).stores({
  connections: 'id',
  database_tabs: 'id',
  saved_query: 'id',
  setting: 'name',
});
