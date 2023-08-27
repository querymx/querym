import { PropsWithChildren } from 'react';

export default function OptionList({
  children,
  minWidth,
}: PropsWithChildren<{ minWidth?: number }>) {
  return <div style={{ minWidth }}>{children}</div>;
}
