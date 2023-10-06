export default abstract class BaseType {
  abstract diff(value: this): boolean;
  abstract compare(value: this): number;
  abstract toString(): string;
  abstract isNull(): boolean;
  abstract isDefault(): boolean;
}
