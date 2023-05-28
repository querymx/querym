export interface ResultChangeCollectorItem {
  row: number;
  cols: { col: number; value: unknown }[];
}

export type ResultChangeEventHandler = (count: number) => void;

/**
 * Collect all the changes and arrange it in the friendly way
 */
export default class ResultChangeCollector {
  protected changes: Record<string, Record<string, unknown>> = {};
  protected onChangeListeners: ResultChangeEventHandler[] = [];

  registerChange(cb: ResultChangeEventHandler) {
    this.onChangeListeners.push(cb);
  }

  unregisterChange(cb: ResultChangeEventHandler) {
    this.onChangeListeners = this.onChangeListeners.filter((cb2) => cb !== cb2);
  }

  protected triggerOnChange() {
    for (const cb of this.onChangeListeners) {
      const count = this.getChangesCount();
      cb(count);
    }
  }

  remove(rowNumber: number, cellNumber: number) {
    if (this.changes[rowNumber]) {
      delete this.changes[rowNumber][cellNumber];
      if (Object.entries(this.changes[rowNumber]).length === 0) {
        delete this.changes[rowNumber];
      }
    }

    this.triggerOnChange();
  }

  add(rowNumber: number, cellNumber: number, value: unknown) {
    if (!this.changes[rowNumber]) {
      this.changes[rowNumber] = {};
    }

    this.changes[rowNumber][cellNumber] = value;
    this.triggerOnChange();
  }

  clear() {
    this.changes = {};
    this.triggerOnChange();
  }

  getChange<T>(
    rowNumber: number,
    cellNumber: number,
    defaultValue: T | undefined | null = undefined
  ) {
    if (this.changes[rowNumber] !== undefined) {
      if (this.changes[rowNumber][cellNumber] !== undefined) {
        return this.changes[rowNumber][cellNumber];
      }
    }
    return defaultValue;
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
