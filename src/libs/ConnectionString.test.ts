import ConnectionString from './ConnectionString';

test('decode MySQL connection string', () => {
  expect(
    ConnectionString.encode({
      id: '',
      name: '',
      type: 'mysql',
      createdAt: 0,
      lastUsedAt: 0,
      config: {
        database: 'testing_db',
        host: 'localhost',
        password: '123',
        user: 'root',
        port: 3306,
      },
    }),
  ).toBe('mysql://root:123@localhost:3306/testing_db');
});
