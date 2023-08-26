import type { Meta, StoryObj } from '@storybook/react';
import Button from 'renderer/components/Button';
import StorybookContainer from './StoryContainer';

function StoryPage() {
  return (
    <StorybookContainer>
      <Button primary>Hello</Button>
    </StorybookContainer>
  );
}

const meta = {
  title: 'Example/Button',
  component: StoryPage,
  tags: ['autodocs'],
} satisfies Meta<typeof StoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {},
};
