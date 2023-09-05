import Dexie from 'dexie';
import { ConnectionConfigTree } from 'drivers/SQLLikeConnection';

export const db = new Dexie('query-master');

db.version(1).stores({
  database_config: 'id',
  database_tabs: 'id',
});

db.version(2)
  .stores({
    database_config: 'id',
    database_tabs: 'id',
    setting: 'name',
  })
  .upgrade(async (trans) => {
    const legacyItems = await trans.table('database_config').toArray();
    trans.table('setting').put({
      name: 'connections',
      value: legacyItems.map(
        (item) =>
          ({
            id: item.id,
            config: item,
            name: item.name,
            nodeType: 'connection',
          } as ConnectionConfigTree)
      ),
    });
  });

db.version(3).stores({
  database_config: 'id',
  database_tabs: 'id',
  saved_query: 'id',
  setting: 'name',
});
