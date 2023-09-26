import getTestExecute from 'drivers/base/fake_execute';
import getMySQLTestingConnection from './_connection';
import MySQLCommonInterface from './MySQLCommonInterface';

const connection = getMySQLTestingConnection();
const common = new MySQLCommonInterface(getTestExecute(connection));

afterAll(async () => {
  connection.close();
});

test('get database schema', async () => {
  const r = (await common.getSchema()).getSchema();
  expect(Object.keys(r)).toContain('querymaster_test');

  const currentDatabase = r['querymaster_test'];
  expect(Object.keys(currentDatabase.tables)).toEqual(['users']);
});
