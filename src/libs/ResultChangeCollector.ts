export interface ResultChangeCollectorItem {
  row: number;
  cols: { col: number; value: unknown }[];
}

export type ResultChangeEventHandler = (count: number) => void;

export interface ResultChanges {
  new: ResultChangeCollectorItem[];
  changes: ResultChangeCollectorItem[];
  remove: number[];
}

/**
 * Collect all the changes and arrange it in the friendly way
 */
export default class ResultChangeCollector {
  protected newRowCount = 0;
  protected removedRowIndex = new Set<number>();
  protected changes: Record<string, Record<string, unknown>> = {};
  protected onChangeListeners: ResultChangeEventHandler[] = [];

  registerChange(cb: ResultChangeEventHandler) {
    this.onChangeListeners.push(cb);
  }

  unregisterChange(cb: ResultChangeEventHandler) {
    this.onChangeListeners = this.onChangeListeners.filter((cb2) => cb !== cb2);
  }

  protected triggerOnChange() {
    const count = this.getChangesCount();
    for (const cb of this.onChangeListeners) {
      cb(count);
    }
  }

  removeRow(rowNumber: number) {
    if (rowNumber < 0) {
      // Remove the new created row.
    } else {
      // Remove the existing row. We just mark it as removed
      this.removedRowIndex.add(rowNumber);
    }
    this.triggerOnChange();
  }

  discardRemoveRow(rowNumber: number) {
    this.removedRowIndex.delete(rowNumber);
    this.triggerOnChange();
  }

  removeChange(rowNumber: number, cellNumber: number) {
    if (this.changes[rowNumber]) {
      delete this.changes[rowNumber][cellNumber];
      if (Object.entries(this.changes[rowNumber]).length === 0) {
        delete this.changes[rowNumber];
      }
    }

    this.triggerOnChange();
  }

  createNewRow() {
    this.newRowCount++;
    this.triggerOnChange();
  }

  addChange(rowNumber: number, cellNumber: number, value: unknown) {
    if (!this.changes[rowNumber]) {
      this.changes[rowNumber] = {};
    }

    this.changes[rowNumber][cellNumber] = value;
    this.triggerOnChange();
  }

  clear() {
    this.changes = {};
    this.removedRowIndex.clear();
    this.newRowCount = 0;
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
    const changes = this.getChanges();
    return changes.changes.length + changes.new.length + changes.remove.length;
  }

  getNewRowCount(): number {
    return this.newRowCount;
  }

  getRemovedRowsIndex(): number[] {
    return Array.from(this.removedRowIndex);
  }

  /**
   * Describe all changes including updating cells,
   * removing rows, and adding new rows
   * @returns
   */
  getChanges(): ResultChanges {
    const changes = Object.entries(this.changes)
      .filter(([rowNumber]) => {
        // We filter out the changes in new rows and removed rows
        const rowIndexNumber = Number(rowNumber);
        return rowIndexNumber >= 0 && !this.removedRowIndex.has(rowIndexNumber);
      })
      .map(([rowNumber, columnList]) => {
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

    const newRowChanges = new Array(this.newRowCount)
      .fill(undefined)
      .map((_, newRowIndex) => {
        const realNewRowindex = -(newRowIndex + 1);
        const newRowChanged = this.changes[realNewRowindex];
        const colChanges = newRowChanged
          ? Object.entries(newRowChanged).map(([colNumber, value]) => {
              return { col: Number(colNumber), value };
            })
          : [];

        return {
          row: realNewRowindex,
          cols: colChanges,
        };
      });

    return {
      changes,
      new: newRowChanges,
      remove: Array.from(this.removedRowIndex),
    };
  }
}
