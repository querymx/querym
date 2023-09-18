import { OptimizeTableHeaderProps } from '.';
import TableHeader from './TableHeader';

export default function TableHeaderList({
  headers,
  onHeaderResize,
}: {
  headers: OptimizeTableHeaderProps[];
  onHeaderResize: (idx: number, newWidth: number) => void;
}) {
  return (
    <thead>
      <tr>
        {headers.map((header, idx) => {
          return (
            <TableHeader
              header={header}
              idx={idx}
              onHeaderResize={onHeaderResize}
            />
          );
        })}
      </tr>
    </thead>
  );
}
