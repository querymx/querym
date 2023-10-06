import Decimal from 'decimal.js';
import BaseType from './BaseType';

export default class NumberType implements BaseType {
  protected value?: Decimal | null;

  constructor(value?: string | null) {
    if (value === null || value === undefined) this.value = value;
    else this.value = new Decimal(value);
  }

  diff(value: NumberType): boolean {
    if (this.value && value.value) {
      return !this.value.eq(value.value);
    }
    return this.value !== value.value;
  }

  compare(value: NumberType): number {
    if (this.value && value.value) {
      return this.value.comparedTo(value.value);
    }

    if (value.value === this.value) return 0;
    if (this.value === null) return -1;
    if (this.value === undefined) return -1;
    if (value.value === null) return 1;
    if (value.value === undefined) return 1;
    return 0;
  }

  isDefault(): boolean {
    return this.value === undefined;
  }

  isNull(): boolean {
    return this.value === null;
  }

  toString() {
    if (this.value === undefined) return '';
    if (this.value === null) return 'NULL';
    return this.value.toString();
  }
}
