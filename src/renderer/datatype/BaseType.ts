export default abstract class BaseType<T = unknown> {
  abstract diff(value: this): boolean;
  abstract compare(value: this): number;
  abstract toString(): string;
  abstract isNull(): boolean;
  abstract isDefault(): boolean;
  abstract matched(search: string): boolean;
  abstract getValue(): T | null | undefined;
}
