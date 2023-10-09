import NumberType from 'renderer/datatype/NumberType';
import ResultChangeCollector, {
  ResultChangeCollectorItem,
} from './ResultChangeCollector';
import StringType from 'renderer/datatype/StringType';
import BaseType from 'renderer/datatype/BaseType';

describe('ResultChangeCollector', () => {
  test('Add change and remove change', () => {
    const collection = new ResultChangeCollector();
    collection.addChange(1, 3, new NumberType(100));
    collection.addChange(1, 3, new NumberType(200));
    collection.addChange(1, 2, new StringType('query master'));
    collection.addChange(2, 1, new NumberType(300));

    expect(collection.getChangesCount()).toBe(2);
    expect(collection.getChange<NumberType>(1, 3)?.getValue()).toBe(200);
    expect(collection.getChange<NumberType>(1, 10)?.getValue()).toBeUndefined();

    let { changes } = collection.getChanges();

    expect(changes.length).toBe(2);
    expect(getChangeCellCount(changes, 1)).toBe(2);
    expect(getChangeCellValue(changes, 1, 3)?.getValue()).toBe(200);
    expect(getChangeCellValue(changes, 1, 2)?.getValue()).toBe('query master');
    expect(getChangeCellValue(changes, 2, 1)?.getValue()).toBe(300);

    collection.removeChange(2, 1);

    changes = collection.getChanges().changes;
    expect(changes.length).toBe(1);
  });

  test('Remove rows', () => {
    const collection = new ResultChangeCollector();
    collection.addChange(1, 2, new NumberType(100));
    collection.addChange(2, 2, new NumberType(200));
    collection.removeRow(2);

    expect(collection.getChangesCount()).toBe(2);
    expect(collection.getRemovedRowsIndex()).toEqual([2]);
    const changes = collection.getChanges();
    expect(changes.changes.length).toBe(1);
    expect(getChangeCellValue(changes.changes, 1, 2)?.getValue()).toBe(100);
    expect(getChangeCellValue(changes.changes, 2, 2)?.getValue()).toBe(
      undefined,
    );

    collection.discardRemoveRow(2);
    expect(collection.getChangesCount()).toBe(2);
    expect(collection.getRemovedRowsIndex()).toEqual([]);
    const changes2 = collection.getChanges();
    expect(changes2.changes.length).toBe(2);
    expect(getChangeCellValue(changes2.changes, 2, 2)?.getValue()).toBe(200);
  });

  test('Insert new rows', () => {
    const collection = new ResultChangeCollector();
    collection.addChange(1, 2, new NumberType(100));
    collection.addChange(2, 2, new NumberType(200));

    collection.createNewRow();
    collection.createNewRow();

    expect(collection.getNewRowCount()).toBe(2);
    expect(collection.getChangesCount()).toBe(4);
    expect(collection.getChanges().changes.length).toBe(2);

    collection.addChange(-1, 2, new NumberType(50));
    expect(collection.getChangesCount()).toBe(4);
    const changes = collection.getChanges();
    expect(changes.new.length).toBe(2);
    expect(getChangeCellValue(changes.changes, -1, 2)?.getValue()).toBe(
      undefined,
    );
    expect(getChangeCellValue(changes.new, -1, 2)?.getValue()).toBe(50);
    expect(getChangeCellValue(changes.changes, 2, 2)?.getValue()).toBe(200);
  });
});

function getChangeCellCount(changes: ResultChangeCollectorItem[], row: number) {
  return changes.find((r) => r.row === row)?.cols?.length || 0;
}

function getChangeCellValue(
  changes: ResultChangeCollectorItem[],
  row: number,
  col: number,
): BaseType | undefined {
  return changes.find((r) => r.row === row)?.cols?.find((c) => c.col === col)
    ?.value;
}
