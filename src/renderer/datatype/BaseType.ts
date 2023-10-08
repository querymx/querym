import { QueryDialetType } from 'libs/QueryBuilder';

export default abstract class BaseType<T = unknown> {
  abstract diff(value: this): boolean;
  abstract compare(value: this): number;
  abstract toString(): string;
  abstract toNullableString(): string | null | undefined;
  abstract isNull(): boolean;
  abstract isDefault(): boolean;
  abstract matched(search: string): boolean;
  abstract getValue(): T | null | undefined;
  abstract toSQL(dialect?: QueryDialetType): unknown;
}
