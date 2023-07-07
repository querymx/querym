import { ConnectionStoreItem } from 'drivers/SQLLikeConnection';
import generateIncrementalName from './generateIncrementalName';

export default function generateDatabaseName(
  dbs: ConnectionStoreItem[],
  name: string
) {
  return generateIncrementalName(
    dbs.map((db) => db.name),
    name
  );
}
