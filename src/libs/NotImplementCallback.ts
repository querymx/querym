export default function NotImplementCallback<T = void>(): T {
  throw new Error('Not implemented');
}
