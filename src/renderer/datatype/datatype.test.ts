import StringType from './StringType';

test('testing string type', () => {
  const a = new StringType('hello');
  const b = new StringType('world');
  const c = new StringType(null);
  const d = new StringType('hello');

  const list = [b, a, c];
  list.sort((s1, s2) => s1.compare(s2));
  expect(list.map((s1) => s1.toString())).toEqual(['NULL', 'hello', 'world']);

  expect(a.diff(d)).toBe(false);
  expect(a.diff(b)).toBe(true);
});
