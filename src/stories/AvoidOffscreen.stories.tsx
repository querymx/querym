import type { Meta, StoryObj } from '@storybook/react';
import StorybookContainer from './StoryContainer';
import AvoidOffscreen from 'renderer/components/AvoidOffscreen';

function StoryPage() {
  return (
    <StorybookContainer>
      <div style={{ position: 'fixed', right: -200, top: 100 }}>
        <AvoidOffscreen>
          <div style={{ width: 400, height: 200, background: 'red' }}></div>
        </AvoidOffscreen>
      </div>
    </StorybookContainer>
  );
}

const meta = {
  title: 'Components/AvoidOffScreen',
  component: StoryPage,
} satisfies Meta<typeof StoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AvoidOffScreen: Story = {
  name: 'Offscreen component will auto correct',
  args: {},
};
