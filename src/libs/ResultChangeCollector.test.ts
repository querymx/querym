import ResultChangeCollector, {
  ResultChangeCollectorItem,
} from './ResultChangeCollector';

describe('ResultChangeCollector', () => {
  test('Add change and remove change', () => {
    const collection = new ResultChangeCollector();
    collection.addChange(1, 3, 100);
    collection.addChange(1, 3, 200);
    collection.addChange(1, 2, 'query master');
    collection.addChange(2, 1, 300);

    expect(collection.getChangesCount()).toBe(2);
    expect(collection.getChange(1, 3)).toBe(200);
    expect(collection.getChange(1, 10)).toBeUndefined();

    let changes = collection.getChanges();

    expect(changes.length).toBe(2);
    expect(getChangeCellCount(changes, 1)).toBe(2);
    expect(getChangeCellValue(changes, 1, 3)).toBe(200);
    expect(getChangeCellValue(changes, 1, 2)).toBe('query master');
    expect(getChangeCellValue(changes, 2, 1)).toBe(300);

    collection.removeChange(2, 1);
    changes = collection.getChanges();
    expect(changes.length).toBe(1);
  });

  test('Remove rows', () => {
    const collection = new ResultChangeCollector();
    collection.addChange(1, 2, 100);
    collection.addChange(2, 2, 200);
    collection.removeRow(2);

    expect(collection.getChangesCount()).toBe(2);
    expect(collection.getChanges()).toBe(1);
    expect(collection.getRemovedRowsIndex()).toEqual([2]);

    collection.discardRemoveRow(2);
    expect(collection.getChangesCount()).toBe(2);
    expect(collection.getChanges()).toBe(2);
    expect(collection.getRemovedRowsIndex()).toEqual([]);
  });

  test('Insert new rows', () => {
    const collection = new ResultChangeCollector();
    collection.addChange(1, 2, 100);
    collection.addChange(2, 2, 200);

    collection.createNewRow();
    collection.createNewRow();

    expect(collection.getNewRowCount()).toBe(2);
    expect(collection.getChangesCount()).toBe(4);
    expect(collection.getChanges()).toBe(2);

    collection.addChange(-1, 2, 100);
    expect(collection.getChangesCount()).toBe(4);
  });
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
