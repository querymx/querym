import type { Meta, StoryObj } from '@storybook/react';
import StorybookContainer from './StoryContainer';
import OptimizeTable from 'renderer/components/OptimizeTable';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import { ContextMenuProvider } from 'renderer/contexts/ContextMenuProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

const tableData = new Array(300)
  .fill(true)
  .map((_, y) => new Array(5).fill(true).map((x) => `Col ${y}, ${x}`));

function StoryPage() {
  return (
    <StorybookContainer>
      <ContextMenuProvider>
        <div
          style={{ width: '700px', height: 400, overflow: 'auto' }}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
        >
          <OptimizeTable
            headers={[
              { name: 'Header1', initialSize: 250 },
              {
                name: 'Header2',
                initialSize: 250,
                tooltip: 'Hello Tooltip with resize',
                resizable: true,
                rightIcon: <FontAwesomeIcon icon={faArrowDown} />,
                menu: [
                  {
                    text: 'Clear Order',
                  },
                  {
                    text: 'Order by ASC',
                    icon: <FontAwesomeIcon icon={faArrowDown} />,
                  },
                  {
                    text: 'Order by DESC',
                    icon: <FontAwesomeIcon icon={faArrowUp} />,
                  },
                ],
              },
              { name: 'Header3', initialSize: 250, tooltip: 'Hello Tooltip' },
              { name: 'Header4', initialSize: 250 },
              { name: 'Header5', initialSize: 250 },
            ]}
            data={tableData}
            renderCell={(y, x) => {
              return <TableCellContent value={tableData[y][x]} />;
            }}
            rowHeight={20}
            renderAhead={10}
            onSelectedRowsIndexChanged={() => {
              return;
            }}
            selectedRowsIndex={[]}
          />
        </div>
      </ContextMenuProvider>
    </StorybookContainer>
  );
}

const meta = {
  title: 'Components/Table',
  component: StoryPage,
} satisfies Meta<typeof StoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AvoidOffScreen: Story = {
  name: 'Table',
  args: {},
};
