export interface ResultChangeCollectorItem {
  row: number;
  cols: { col: number; value: unknown }[];
}

/**
 * Collect all the changes and arrange it in the friendly way
 */
export default class ResultChangeCollector {
  protected changes: Record<string, Record<string, unknown>> = {};

  remove(rowNumber: number, cellNumber: number) {
    if (this.changes[rowNumber]) {
      delete this.changes[rowNumber][cellNumber];
      if (Object.entries(this.changes[rowNumber]).length === 0) {
        delete this.changes[rowNumber];
      }
    }
  }

  add(rowNumber: number, cellNumber: number, value: unknown) {
    if (!this.changes[rowNumber]) {
      this.changes[rowNumber] = {};
    }

    this.changes[rowNumber][cellNumber] = value;
  }

  clear() {
    this.changes = {};
  }

  getChange(rowNumber: number, cellNumber: number) {
    if (this.changes[rowNumber]) {
      return this.changes[rowNumber][cellNumber];
    }
    return undefined;
  }

  getChangesCount() {
    return Object.entries(this.changes).length;
  }

  getChanges(): ResultChangeCollectorItem[] {
    return Object.entries(this.changes).map(([rowNumber, columnList]) => {
      return {
        row: Number(rowNumber),
        cols: Object.entries(columnList).map(([colNumber, value]) => {
          return {
            col: Number(colNumber),
            value,
          };
        }),
      };
    });
  }
}
