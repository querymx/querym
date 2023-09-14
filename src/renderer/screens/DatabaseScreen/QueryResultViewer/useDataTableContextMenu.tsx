import { faPlusCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ResultChangeCollector from 'libs/ResultChangeCollector';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import { TableCellManager } from 'renderer/contexts/EditableQueryResultProvider';

interface DataTableContextMenuDeps {
  collector: ResultChangeCollector;
  cellManager: TableCellManager;
  selectedRowsIndex: number[];
  newRowCount: number;
  data: { data: Record<string, unknown>; rowIndex: number }[];
}

export default function useDataTableContextMenu({
  collector,
  cellManager,
  selectedRowsIndex,
  newRowCount,
  data,
}: DataTableContextMenuDeps) {
  return useContextMenu(() => {
    const selectedCell = cellManager.getFocusCell();

    function onCopyAsJson() {
      window.navigator.clipboard.writeText(
        JSON.stringify(
          selectedRowsIndex.map((rowIndex) => data[rowIndex].data),
          undefined,
          2
        )
      );
    }

    return [
      {
        text: 'Insert new row',
        onClick: () => {
          collector.createNewRow();
        },
        icon: <FontAwesomeIcon icon={faPlusCircle} color="#27ae60" />,
      },
      {
        text: 'Remove selected rows',
        destructive: true,
        disabled: selectedRowsIndex.length === 0,
        onClick: () => {
          for (const selectedRowIndex of selectedRowsIndex) {
            collector.removeRow(data[selectedRowIndex].rowIndex);
          }
        },
        icon: <FontAwesomeIcon icon={faTimesCircle} />,
        separator: true,
      },
      {
        text: 'Insert NULL',
        disabled: !selectedCell,
        onClick: () => selectedCell?.insert(null),
        separator: true,
      },
      {
        text: 'Copy',
        hotkey: 'Ctrl + C',
        disabled: !selectedCell,
        onClick: () => selectedCell?.copy(),
      },
      {
        text: 'Copy Selected Rows As',
        disabled: !selectedCell,
        children: [
          { text: 'As Excel', disabled: true },
          { text: 'As CSV', disabled: true },
          { text: 'As JSON', onClick: onCopyAsJson },
          { text: 'As SQL', disabled: true },
        ],
      },
      {
        text: 'Paste',
        hotkey: 'Ctrl + V',
        disabled: !selectedCell,
        onClick: () => selectedCell?.paste(),
        separator: true,
      },
      {
        text: `Discard All Changes`,
        destructive: true,
        disabled: !collector.getChangesCount(),
        onClick: () => {
          const rows = collector.getChanges().changes;

          for (const row of rows) {
            for (const col of row.cols) {
              const cell = cellManager.get(row.row, col.col);
              if (cell) {
                cell.discard();
              }
            }
          }

          collector.clear();
        },
      },
    ];
  }, [collector, newRowCount, selectedRowsIndex, data]);
}
