import type { Meta, StoryObj } from '@storybook/react';
import StorybookContainer from './StoryContainer';
import { useState } from 'react';
import SchemaEditor from 'renderer/components/SchemaEditor';
import { TableColumnSchema } from 'types/SqlSchema';
import { TableColumnsAlterDiff } from 'renderer/components/SchemaEditor/TableColumnsAlterDiff';

const INITIAL_COLUMN: TableColumnSchema[] = [
  {
    name: 'id',
    dataType: 'int',
    charLength: null,
    default: '0',
    comment: '',
    nullable: false,
  },
  {
    name: 'name',
    dataType: 'varchar',
    charLength: 255,
    default: '',
    comment: '',
    nullable: false,
  },
];

function StoryPage() {
  const [diff] = useState(() => new TableColumnsAlterDiff(INITIAL_COLUMN));

  return (
    <StorybookContainer>
      <SchemaEditor diff={diff} />
    </StorybookContainer>
  );
}

const meta = {
  title: 'Components/SchemaEditor',
  component: StoryPage,
  tags: ['autodocs'],
} satisfies Meta<typeof StoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
