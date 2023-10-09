import { QueryBuilder, QueryDialetType } from 'libs/QueryBuilder';
import BaseType from './BaseType';

interface Point {
  x: number;
  y: number;
}

export default class PointType implements BaseType<Point> {
  protected value: Point | null | undefined;

  constructor(value: Point | null | undefined) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  toString(): string {
    if (this.value === null) return 'NULL';
    if (this.value === undefined) return '';
    return `${this.value.x}, ${this.value.y}`;
  }

  toNullableString(): string | null | undefined {
    if (this.value === null) return null;
    if (this.value === undefined) return null;
    return this.toString();
  }

  compare(value: PointType): number {
    if (value.value && this.value) {
      const diffX = this.value.x - value.value.x;
      if (diffX !== 0) return diffX;
      return this.value.y - value.value.y;
    }

    if (value.value === this.value) return 0;
    if (this.value === null) return -1;
    if (this.value === undefined) return -1;
    if (value.value === null) return 1;
    if (value.value === undefined) return 1;
    return 0;
  }

  diff(value: PointType): boolean {
    if (value.value && this.value) {
      return value.value.x !== this.value.x || value.value.y !== this.value.y;
    }
    return this.value !== value.value;
  }

  isDefault(): boolean {
    return this.value === undefined;
  }

  isNull(): boolean {
    return this.value === undefined;
  }

  matched(search: string): boolean {
    return this.toString().includes(search);
  }

  toSQL(dialect?: QueryDialetType | undefined): unknown {
    if (!this.value) return this.value;

    if (dialect === 'mysql') {
      return QueryBuilder.raw(`POINT(${this.value.x}, ${this.value.y})`);
    }

    if (dialect === 'postgre') {
      return `(${this.value.x}, ${this.value.y})`;
    }

    return this.toString();
  }
}
