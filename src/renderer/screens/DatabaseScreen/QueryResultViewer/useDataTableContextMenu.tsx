import { faPlusCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TableEditableRule } from 'libs/GenerateSqlFromChanges';
import ResultChangeCollector from 'libs/ResultChangeCollector';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';
import { TableCellManager } from 'renderer/contexts/EditableQueryResultProvider';
import { QueryResultHeader, QueryResultWithIndex } from 'types/SqlResult';
import { getDisplayableFromDatabaseRows } from '../../../../libs/TransformResult';
import BaseType from 'renderer/datatype/BaseType';
import SQLCommonInterface from 'drivers/base/SQLCommonInterface';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';
import { QueryDialetType, qb } from 'libs/QueryBuilder';

interface DataTableContextMenuDeps {
  collector: ResultChangeCollector;
  cellManager: TableCellManager;
  selectedRowsIndex: number[];
  newRowCount: number;
  data: QueryResultWithIndex<BaseType>[];
  headers: QueryResultHeader[];
  rules: TableEditableRule;
  setSelectedRowsIndex: React.Dispatch<React.SetStateAction<number[]>>;
  dialect: QueryDialetType;
}

function dataToArray(
  common: SQLCommonInterface,
  data: QueryResultWithIndex<BaseType>,
  headers: QueryResultHeader[],
  rules?: TableEditableRule,
): BaseType[] {
  const result = new Array(headers.length).fill(true).map((_, idx) => {
    return data.data[headers[idx].name];
  });

  if (rules?.insertablePk) {
    for (let i = 0; i < rules.insertablePk.length; i++) {
      result[rules.insertablePk[i].columnNumber] = common.createTypeValue(
        headers[rules.insertablePk[i].columnNumber],
        undefined,
      );
    }
  }

  return result;
}

export default function useDataTableContextMenu({
  collector,
  cellManager,
  selectedRowsIndex,
  newRowCount,
  data,
  headers,
  rules,
  setSelectedRowsIndex,
  dialect,
}: DataTableContextMenuDeps) {
  const { common } = useSqlExecute();

  return useContextMenu(() => {
    const selectedCell = cellManager.getFocusCell();

    function onCopyAsExcel() {
      const selectedRows = selectedRowsIndex.map(
        (rowIndex) => data[rowIndex].data,
      );
      const displayableRows = getDisplayableFromDatabaseRows(
        selectedRows,
        headers,
      );
      const headerNames = headers.map((header) => header.name).join('\t');
      const excelString = [headerNames];
      excelString.push(
        ...displayableRows.map((row) => Object.values(row).join('\t')),
      );

      window.navigator.clipboard.writeText(excelString.join('\n'));
    }

    function onCopyAsJson() {
      const jsonFriendly = selectedRowsIndex.map((rowIndex) =>
        Object.entries(data[rowIndex].data).reduce(
          (acc, [colName, colValue]) => {
            acc[colName] = colValue.toNullableString();
            return acc;
          },
          {} as Record<string, unknown>,
        ),
      );

      window.navigator.clipboard.writeText(
        JSON.stringify(jsonFriendly, undefined, 2),
      );
    }

    function onCopyAsMarkdown() {
      const selectedRows = selectedRowsIndex.map(
        (rowIndex) => data[rowIndex].data,
      );
      const displayableRows = getDisplayableFromDatabaseRows(
        selectedRows,
        headers,
      );
      const headerNames = headers.map((header) => header.name);
      const markdownString = [headerNames.join(' | ')];
      markdownString.push(
        new Array(headerNames.length).fill('---').join(' | '),
      );
      markdownString.push(
        ...displayableRows.map((row) =>
          headerNames.map((header) => row[header]).join(' | '),
        ),
      );

      window.navigator.clipboard.writeText(markdownString.join('\n'));
    }

    function onCopyInsertSQL() {
      const selectedRows = selectedRowsIndex.map(
        (rowIndex) => data[rowIndex].data,
      );

      const tableList = Array.from(
        new Set(headers.map((header) => header.schema?.table).filter(Boolean)),
      );

      const tableName =
        (tableList.length === 1 ? tableList[0] : 'Unknown') ?? 'Unknown';

      const lines = selectedRows
        .map((row) => {
          return qb(dialect)
            .table(tableName)
            .insert(
              Object.keys(row).reduce<Record<string, unknown>>((a, b) => {
                a[b] = row[b].toSQL(dialect);
                return a;
              }, {}),
            )
            .toRawSQL();
        })
        .join(';\n');

      window.navigator.clipboard.writeText(lines);
    }

    const lastSelectedRow =
      selectedRowsIndex.length > 0
        ? data[selectedRowsIndex[selectedRowsIndex.length - 1]]
        : undefined;

    return [
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
          { text: 'As Excel', onClick: onCopyAsExcel },
          { text: 'As CSV', disabled: true },
          { text: 'As JSON', onClick: onCopyAsJson },
          { text: 'As Markdown', onClick: onCopyAsMarkdown },
          { text: 'As SQL Insert', onClick: onCopyInsertSQL },
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
        text: 'Insert new row',
        disabled: !rules.insertable,
        onClick: () => {
          const newRow = new Array(headers.length)
            .fill(undefined)
            .map((_, idx) => {
              return common.createTypeValue(headers[idx], undefined);
            });
          collector.createNewRow(newRow);
        },
        icon: <FontAwesomeIcon icon={faPlusCircle} color="#27ae60" />,
      },
      {
        text: 'Duplicate row without key',
        disabled: !lastSelectedRow,
        onClick: () => {
          if (lastSelectedRow) {
            collector.createNewRow(
              dataToArray(common, lastSelectedRow, headers, rules),
            );
          }
        },
        icon: <FontAwesomeIcon icon={faPlusCircle} color="#27ae60" />,
      },
      {
        text: 'Duplicate row with key',
        disabled: !lastSelectedRow,
        onClick: () => {
          if (lastSelectedRow) {
            collector.createNewRow(
              dataToArray(common, lastSelectedRow, headers),
            );
          }
        },
        icon: <FontAwesomeIcon icon={faPlusCircle} color="#27ae60" />,
      },
      {
        text: 'Remove selected rows',
        destructive: true,
        disabled: selectedRowsIndex.length === 0 || !rules.removable,
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
  }, [
    collector,
    newRowCount,
    setSelectedRowsIndex,
    selectedRowsIndex,
    data,
    rules,
    common,
    dialect,
  ]);
}
