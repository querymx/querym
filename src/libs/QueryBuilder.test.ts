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

test('Test update statement with multiple condition', () => {
  const qb = new QueryBuilder('mysql');

  expect(
    qb
      .table('users')
      .update({ name: 'query-master' })
      .where({ id: 5, age: 20 })
      .toRawSQL()
  ).toBe("UPDATE `users` SET `name`='query-master' WHERE `id`=5 AND `age`=20;");
});

test('Test select table without selected field', () => {
  const qb = new QueryBuilder('mysql');
  expect(qb.table('users').select().toRawSQL()).toBe('SELECT * FROM `users`;');
});

test('Test select table selected field', () => {
  const qb = new QueryBuilder('mysql');
  expect(qb.table('users').select('id', 'name').toRawSQL()).toBe(
    'SELECT `id`,`name` FROM `users`;'
  );
});

test('Test select table selected field with limit', () => {
  const qb = new QueryBuilder('mysql');
  expect(qb.table('users').select('id', 'name').limit(10).toRawSQL()).toBe(
    'SELECT `id`,`name` FROM `users` LIMIT 10;'
  );
});

test('Delete table record with where', () => {
  const qb = new QueryBuilder('mysql');
  expect(qb.table('users').where({ id: 5 }).delete().toRawSQL()).toBe(
    'DELETE FROM `users` WHERE `id`=5;'
  );
});

test('Insert table', () => {
  const qb = new QueryBuilder('mysql');
  expect(
    qb.table('users').insert({ username: 'visal', age: 5 }).toRawSQL()
  ).toBe("INSERT INTO `users`(`username`, `age`) VALUES('visal', 5);");
});
