import PgCommonInterface from 'drivers/pg/PgCommonInterface';
import getTestExecute from 'drivers/base/fake_execute';
import getPgTestingConnection from './_connection';

const connection = getPgTestingConnection();
const common = new PgCommonInterface(getTestExecute(connection));

afterAll(async () => {
  connection.close();
});

test('get database schema', async () => {
  const r = (await common.getSchema()).getSchema();
  expect(Object.keys(r)).toContain('public');

  const currentDatabase = r['public'];
  expect(Object.keys(currentDatabase.tables)).toEqual(['users']);
});
