import BaseType from './BaseType';

export default class StringType implements BaseType {
  protected value?: string | null;

  constructor(value?: string | null) {
    this.value = value;
  }

  diff(value: StringType): boolean {
    return this.value !== value.value;
  }

  compare(value: StringType): number {
    if (value.value === this.value) return 0;
    if (this.value === null) return -1;
    if (this.value === undefined) return -1;
    if (value.value === null) return 1;
    if (value.value === undefined) return 1;

    if (value.value < this.value) {
      return 1;
    } else {
      return -1;
    }
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
