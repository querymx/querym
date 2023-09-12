import MySQLConnection from 'drivers/mysql/MySQLConnection';
import { qb } from 'libs/QueryBuilder';

const connection = new MySQLConnection(
  {
    database: 'querymaster_test',
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: '123456',
  },
  () => {
    return;
  }
);

afterAll(async () => {
  connection.close();
});

test('test normal query', async () => {
  const r = await connection.query(
    qb('mysql').table('users').select().toRawSQL()
  );

  expect(r.headers).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'id' }),
      expect.objectContaining({ name: 'name' }),
    ])
  );
});
