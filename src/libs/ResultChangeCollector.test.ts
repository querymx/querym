import ResultChangeCollector, {
  ResultChangeCollectorItem,
} from './ResultChangeCollector';

test('Test ResultChangeCollector', () => {
  const collection = new ResultChangeCollector();
  collection.add(1, 3, 100);
  collection.add(1, 3, 200);
  collection.add(1, 2, 'query master');
  collection.add(2, 1, 300);

  expect(collection.getChangesCount()).toBe(2);
  expect(collection.getChange(1, 3)).toBe(200);
  expect(collection.getChange(1, 10)).toBeUndefined();

  let changes = collection.getChanges();

  expect(changes.length).toBe(2);
  expect(getChangeCellCount(changes, 1)).toBe(2);
  expect(getChangeCellValue(changes, 1, 3)).toBe(200);
  expect(getChangeCellValue(changes, 1, 2)).toBe('query master');
  expect(getChangeCellValue(changes, 2, 1)).toBe(300);

  collection.remove(2, 1);
  changes = collection.getChanges();
  expect(changes.length).toBe(1);
});

function getChangeCellCount(changes: ResultChangeCollectorItem[], row: number) {
  return changes.find((r) => r.row === row)?.cols?.length || 0;
}

function getChangeCellValue(
  changes: ResultChangeCollectorItem[],
  row: number,
  col: number
): unknown | undefined {
  return changes.find((r) => r.row === row)?.cols?.find((c) => c.col === col)
    ?.value;
}
