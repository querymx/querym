import { SqlProtectionLevel, SqlRunnerManager } from './SqlRunnerManager';

test('Testing running multiple statement', async () => {
  const executor = jest.fn();
  const runner = new SqlRunnerManager(executor);

  await runner.execute(SqlProtectionLevel.NeedConfirm, [
    { sql: 'SELECT * FROM users' },
    { sql: 'SELECT * FROM customers' },
  ]);

  expect(executor).toBeCalledTimes(2);
});

test('Testing running statements with non-block beforeAll event', async () => {
  const executor = jest.fn();
  const runner = new SqlRunnerManager(executor);

  runner.registerBeforeAll(async () => {
    return true;
  });

  await runner.execute(SqlProtectionLevel.NeedConfirm, [
    { sql: 'SELECT * FROM users' },
  ]);

  expect(executor).toBeCalledTimes(1);
});

test('Testing block statements from running at beforeAll event', async () => {
  const executor = jest.fn();
  const runner = new SqlRunnerManager(executor);

  runner.registerBeforeAll(async () => {
    return false;
  });

  try {
    await runner.execute(SqlProtectionLevel.NeedConfirm, [
      { sql: 'SELECT * FROM users' },
    ]);
  } catch (e) {
    expect(e).toBeTruthy();
  }

  expect(executor).toBeCalledTimes(0);
});

test('Testing unregister beforeAll callback', async () => {
  const executor = jest.fn();
  const runner = new SqlRunnerManager(executor);

  const cb = jest.fn().mockReturnValue(true);

  runner.registerBeforeAll(cb);
  runner.unregisterBeforeAll(cb);

  await runner.execute(SqlProtectionLevel.NeedConfirm, [
    { sql: 'SELECT * FROM users' },
  ]);

  expect(cb).toBeCalledTimes(0);
});
