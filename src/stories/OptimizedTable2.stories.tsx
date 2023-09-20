import type { Meta, StoryObj } from '@storybook/react';
import StorybookContainer from './StoryContainer';
import OptimizeTable from 'renderer/components/OptimizeTable';
import TableCellContent from 'renderer/components/ResizableTable/TableCellContent';
import { ContextMenuProvider } from 'renderer/contexts/ContextMenuProvider';

const tableData = new Array(300)
  .fill(true)
  .map((_, y) => new Array(5).fill(true).map((_, x) => `Col ${y}, ${x}`));

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
            stickyHeaderIndex={0}
            headers={[
              { name: 'Header1', initialSize: 250, resizable: true },
              {
                name: 'Header2',
                initialSize: 250,
                tooltip: 'Hello Tooltip with resize',
                resizable: true,
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
  title: 'Components/Table2',
  component: StoryPage,
} satisfies Meta<typeof StoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OptimizeTableStory: Story = {
  name: 'Table with sticky header',
  args: {},
};
