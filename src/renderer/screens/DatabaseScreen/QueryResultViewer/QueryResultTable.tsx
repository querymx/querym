import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import TableCell from 'renderer/screens/DatabaseScreen/QueryResultViewer/TableCell/TableCell';
import { QueryResultHeader, QueryResultWithIndex } from 'types/SqlResult';
import {
  TableEditableRule,
  getEditableRule,
} from 'libs/GenerateSqlFromChanges';
import { useSchema } from 'renderer/contexts/SchemaProvider';
import OptimizeTable from 'renderer/components/OptimizeTable';
import Icon from 'renderer/components/Icon';
import useDataTableContextMenu from './useDataTableContextMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { useEditableResult } from 'renderer/contexts/EditableQueryResultProvider';
import BaseType from 'renderer/datatype/BaseType';
import { useSqlExecute } from 'renderer/contexts/SqlExecuteProvider';

export interface QuertResultTableSortedHeader {
  by: 'ASC' | 'DESC';
  header: QueryResultHeader;
}

interface QueryResultTableProps {
  headers: QueryResultHeader[];
  result: QueryResultWithIndex<BaseType>[];
  onSortHeader?: (header: QuertResultTableSortedHeader) => void;
  onSortReset?: () => void;
  sortedHeader?: QuertResultTableSortedHeader;
}

function QueryResultTable({
  headers,
  result,
  onSortHeader,
  onSortReset,
  sortedHeader,
}: QueryResultTableProps) {
  const { common } = useSqlExecute();
  const [stickyHeaderIndex, setStickyHeaderIndex] = useState<
    number | undefined
  >();
  const [newRowCount, setNewRowCount] = useState(0);
  const { collector, cellManager } = useEditableResult();
  const { schema, currentDatabase, dialect } = useSchema();

  const [selectedRowsIndex, setSelectedRowsIndex] = useState<number[]>([]);
  const [removeRowsIndex, setRemoveRowsIndex] = useState<number[]>([]);
  const [revision, setRevision] = useState<number>(0);

  const newRowsIndex = useMemo(
    () => new Array(newRowCount).fill(0).map((_, idx) => idx),
    [newRowCount],
  );

  useEffect(() => {
    const onChangeUpdate = (_: number, revision: number) => {
      setNewRowCount(collector.getNewRowCount());
      setRemoveRowsIndex(collector.getRemovedRowsIndex());
      setRevision(revision);
    };

    collector.registerChange(onChangeUpdate);
    return () => collector.unregisterChange(onChangeUpdate);
  }, [collector, setNewRowCount]);

  const handleSelectedRowsChange = (selectedRows: number[]) => {
    setSelectedRowsIndex(selectedRows);
  };

  const data: { data: Record<string, BaseType>; rowIndex: number }[] =
    useMemo(() => {
      const newRows = new Array(newRowCount)
        .fill(false)
        .map((_, newRowIndex) => {
          return {
            rowIndex: -(newRowIndex + 1),
            data: headers.reduce(
              (prev, header) => ({
                ...prev,
                [header.name]: common.createTypeValue(header, undefined),
              }),
              {},
            ),
          };
        });

      return [...newRows, ...result];
    }, [result, newRowCount, common]);

  const rules = useMemo<TableEditableRule>(() => {
    if (headers && currentDatabase && schema) {
      return getEditableRule(headers, schema.getDatabase(currentDatabase));
    }

    return {
      updatableTables: {},
      insertable: false,
      removable: false,
    };
  }, [result, schema, currentDatabase]);

  const { updatableTables } = rules;

  const { handleContextMenu } = useDataTableContextMenu({
    data,
    cellManager,
    collector,
    newRowCount,
    selectedRowsIndex,
    headers,
    rules,
    setSelectedRowsIndex,
    dialect,
  });

  const headerMemo = useMemo(() => {
    function getInitialSizeByHeaderType(_: number, header: QueryResultHeader) {
      if (header.type.type === 'number') {
        return 100;
      } else if (
        header.type.type === 'string' ||
        header.type.type === 'decimal'
      ) {
        // Check the last 100 records
        const maxLength = Math.max(
          ...result.slice(0, 100).map(({ data: row }) => {
            if (typeof row[header.name] === 'string')
              return row[header.name].toString().length;
            return 10;
          }),
        );

        return Math.max(150, Math.min(500, maxLength * 8));
      }

      return 150;
    }

    return headers.map((header, idx) => ({
      name: header.name || '',
      resizable: true,
      icon: header?.schema?.primaryKey ? (
        <Icon.GreenKey size="sm" />
      ) : undefined,
      rightIcon:
        sortedHeader && sortedHeader.header.name === header.name ? (
          sortedHeader.by === 'ASC' ? (
            <FontAwesomeIcon icon={faChevronDown} />
          ) : (
            <FontAwesomeIcon icon={faChevronUp} />
          )
        ) : undefined,
      tooltip: header.columnDefinition?.comment,
      menu: [
        {
          text: 'Sticky',
          icon:
            idx === stickyHeaderIndex ? (
              <FontAwesomeIcon icon={faCheck} />
            ) : undefined,
          separator: true,
          onClick: () => {
            if (stickyHeaderIndex === idx) {
              setStickyHeaderIndex(undefined);
            } else {
              setStickyHeaderIndex(idx);
            }
          },
        },
        {
          text: 'Reset Order',
          disabled: !onSortHeader,
          onClick: () => {
            if (onSortReset) {
              onSortReset();
            }
          },
        },
        {
          text: 'Order by ASC',
          icon: <FontAwesomeIcon icon={faArrowDown} />,
          disabled: !onSortHeader,
          onClick: () => {
            if (onSortHeader) {
              onSortHeader({ header, by: 'ASC' });
            }
          },
        },
        {
          text: 'Order by DESC',
          icon: <FontAwesomeIcon icon={faArrowUp} />,
          disabled: !onSortHeader,
          onClick: () => {
            if (onSortHeader) {
              onSortHeader({ header, by: 'DESC' });
            }
          },
        },
      ],
      initialSize: Math.max(
        header.name.length * 10,
        getInitialSizeByHeaderType(idx, header),
      ),
    }));
  }, [
    result,
    onSortHeader,
    sortedHeader,
    stickyHeaderIndex,
    setStickyHeaderIndex,
  ]);

  const renderCell = useCallback(
    (y: number, x: number) => {
      if (data[y]) {
        return (
          <TableCell
            key={data[y].rowIndex + '_' + x + '_' + revision}
            value={data[y].data[headers[x].name]}
            header={headers[x]}
            col={x}
            row={data[y].rowIndex}
            readOnly={!updatableTables[headers[x]?.schema?.table || '']}
          />
        );
      }
      return <></>;
    },
    [data, result, updatableTables, newRowCount, revision],
  );

  const relativeRemoveRowsIndex = useMemo(() => {
    return removeRowsIndex.map((removeIndex) => {
      return data.findIndex(({ rowIndex }) => rowIndex === removeIndex) ?? 0;
    });
  }, [removeRowsIndex, data]);

  if (!headers || !result) {
    return <div>No result</div>;
  }

  return (
    <div className={styles.container} onContextMenu={handleContextMenu}>
      <OptimizeTable
        stickyHeaderIndex={stickyHeaderIndex}
        headers={headerMemo}
        data={data}
        renderAhead={20}
        renderCell={renderCell}
        rowHeight={35}
        newRowsIndex={newRowsIndex}
        removedRowsIndex={relativeRemoveRowsIndex}
        selectedRowsIndex={selectedRowsIndex}
        onSelectedRowsIndexChanged={handleSelectedRowsChange}
      />
    </div>
  );
}

export default React.memo(QueryResultTable);
