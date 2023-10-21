import BaseType from './BaseType';
import deepEqual from 'deep-equal';

export default class JsonType implements BaseType<object | string> {
  protected value?: object | string | null;

  constructor(value?: object | string | null) {
    if (typeof value === 'object') this.value = value;
    else if (typeof value === 'string') {
      try {
        this.value = JSON.parse(value);
      } catch {
        this.value = value;
      }
    } else {
      this.value = value;
    }
  }

  diff(value: JsonType): boolean {
    if (this.value && value.value) {
      return !deepEqual(this.value, value.value);
    }
    return this.value !== value.value;
  }

  compare(value: JsonType): number {
    if (this.value && value.value) {
      return this.value.toString().localeCompare(value.value.toString());
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
    return JSON.stringify(this.value, undefined, 2);
  }

  toNullableString() {
    if (this.value === undefined) return undefined;
    if (this.value === null) return null;
    return JSON.stringify(this.value, undefined, 2);
  }

  toSQL(): unknown {
    return this.toNullableString();
  }

  matched(search: string) {
    if (this.value === null) return false;
    if (this.value === undefined) return false;

    const stringValue = this.value.toString().toLowerCase();
    return stringValue.includes(search);
  }

  getValue(): object| string | null | undefined {
    return this.value;
  }
}
