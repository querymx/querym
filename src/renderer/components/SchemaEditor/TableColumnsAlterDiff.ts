import { TableColumnSchema } from 'types/SqlSchema';

interface TableColumnsAlterDiffNode {
  index: number;
  original: TableColumnSchema | null;
  changed: Partial<TableColumnSchema> | null;
}

interface ColumnNode extends TableColumnsAlterDiffNode {
  index: number;
  original: TableColumnSchema | null;
  changed: Partial<TableColumnSchema> | null;
  next: ColumnNode | null;
  prev: ColumnNode | null;
}

export class TableColumnsAlterDiff {
  protected root: ColumnNode | null = null;

  /**
   * Initial from original columns
   *
   * @param columns
   * @returns
   */
  constructor(columns: TableColumnSchema[]) {
    const root: ColumnNode = {
      next: null,
      prev: null,
      index: 0,
      original: columns[0],
      changed: {},
    };

    let currentNode = root;
    for (let i = 1; i < columns.length; i++) {
      const newNode: ColumnNode = {
        next: null,
        prev: currentNode,
        index: i,
        original: columns[i],
        changed: {},
      };

      currentNode.next = newNode;
      currentNode = newNode;
    }

    this.root = root;
  }

  toArray() {
    if (!this.root) return [];

    const arr: TableColumnsAlterDiffNode[] = [];
    let ptr: ColumnNode | null = this.root;

    while (ptr) {
      arr.push({
        index: ptr.index,
        original: ptr.original ? Object.freeze({ ...ptr.original }) : null,
        changed: Object.freeze({ ...ptr.changed }),
      });
      ptr = ptr.next;
    }

    return arr;
  }
}
