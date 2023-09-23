import { qb } from 'libs/QueryBuilder';
import getTestingConnection from './_connection';

const connection = getTestingConnection();

afterAll(async () => {
  connection.close();
});

test('perform normal query', async () => {
  const r = await connection.query(
    qb('postgre').table('users').select().toRawSQL()
  );

  expect(r.headers).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'id' }),
      expect.objectContaining({ name: 'name' }),
    ])
  );
});
