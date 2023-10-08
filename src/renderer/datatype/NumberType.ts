import BaseType from './BaseType';

export default class NumberType implements BaseType<number> {
  protected value?: number | null;

  constructor(value?: number | null | string) {
    if (typeof value === 'string') this.value = Number(value);
    else this.value = value;
  }

  diff(value: NumberType) {
    return this.value !== value.value;
  }

  compare(value: NumberType): number {
    if (this.value === value.value) return 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this.value as any) > (value.value as any)) return 1;
    return -1;
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

  getValue(): number | null | undefined {
    return this.value;
  }
}
