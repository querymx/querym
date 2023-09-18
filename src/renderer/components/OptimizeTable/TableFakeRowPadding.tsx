import { PropsWithChildren } from 'react';

export default function TableFakeRowPadding({
  children,
  colCount,
  colStart,
  colEnd,
  className,
  onMouseDown,
}: PropsWithChildren<{
  colCount: number;
  colStart: number;
  colEnd: number;
  className: string;
  onMouseDown: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
}>) {
  return (
    <tr onMouseDown={onMouseDown} className={className}>
      {colStart > 0 && (
        <td
          style={{
            gridColumn: `span ${colStart}`,
          }}
        />
      )}
      {children}
      {colEnd < colCount - 1 && (
        <td
          style={{
            gridColumn: `span ${colCount - 1 - colEnd}`,
          }}
        />
      )}
    </tr>
  );
}
