import { QueryBuilder } from './QueryBuilder';

test('Test update statement with condition', () => {
  const qb = new QueryBuilder('mysql');

  expect(
    qb
      .table('users')
      .update({ name: 'query-master' })
      .where({ id: 5 })
      .toRawSQL()
  ).toBe("UPDATE `users` SET `name`='query-master' WHERE `id`=5;");
});
