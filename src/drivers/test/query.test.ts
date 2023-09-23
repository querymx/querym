import { qb } from 'libs/QueryBuilder';
import getTestingConnection, { TEST_DRIVER } from './connection';

const connection = getTestingConnection();

afterAll(async () => {
  connection.close();
});

test('test normal query', async () => {
  try {
    const r = await connection.query(
      qb(TEST_DRIVER).table('users').select().toRawSQL()
    );

    expect(r.headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'id' }),
        expect.objectContaining({ name: 'name' }),
      ])
    );
  } catch (e) {
    console.log(e);
  }
});
