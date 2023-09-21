import type { Meta, StoryObj } from '@storybook/react';
import StorybookContainer from './StoryContainer';
import KeyboardKey from 'renderer/components/KeyboardKey';

function StoryPage() {
  return (
    <StorybookContainer>
      <KeyboardKey name="F9" />
    </StorybookContainer>
  );
}

const meta = {
  title: 'Components/KeyboardKey',
  component: StoryPage,
} satisfies Meta<typeof StoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  name: 'KeyboardKey',
  args: {},
};
