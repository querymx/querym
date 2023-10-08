import BaseType from './BaseType';

export default class StringType implements BaseType<string> {
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

  toNullableString() {
    if (this.value === undefined) return undefined;
    if (this.value === null) return null;
    return this.value.toString();
  }

  toSQL(): unknown {
    return this.value;
  }

  matched(search: string) {
    if (this.value === null) return false;
    if (this.value === undefined) return false;

    const stringValue = this.value.toString().toLowerCase();
    return stringValue.includes(search);
  }

  getValue() {
    return this.value;
  }
}
