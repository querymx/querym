import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';

export default function generateDatabaseName(
  dbs: ConnectionStoreItem[],
  name: string
) {
  const finalName = name.replace(/ \(\d+\)$/g, '');

  for (let i = 0; i < 100; i++) {
    const newName = i > 0 ? `${finalName} (${i})` : finalName;
    if (!dbs.find((db) => db.name === newName)) return newName;
  }

  return '';
}
