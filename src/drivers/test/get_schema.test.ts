import PgCommonInterface from 'drivers/pg/PgCommonInterface';
import getTestingConnection, { getTestExecute } from './connection';

const connection = getTestingConnection();
const common = new PgCommonInterface(getTestExecute(connection));

afterAll(async () => {
  connection.close();
});

test('Get database schema', async () => {
  const r = await common.getSchema();
  expect(Object.keys(r)).toEqual([
    'public',
    'information_schema',
    'pg_catalog',
    'pg_toast',
  ]);
});
