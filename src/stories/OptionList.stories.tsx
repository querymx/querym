import type { Meta, StoryObj } from '@storybook/react';
import StorybookContainer from './StoryContainer';
import OptionList from 'renderer/components/OptionList';
import OptionListItem from 'renderer/components/OptionList/OptionListItem';
import DropContainer from 'renderer/components/DropContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

function StoryPage() {
  return (
    <StorybookContainer>
      <div style={{ position: 'absolute', left: 300 }}>
        <DropContainer>
          <OptionList>
            <OptionListItem labelWidth={150} label="Copy As" />
            <OptionListItem
              labelWidth={150}
              label="Copy"
              right="Ctrl + C"
              icon={<FontAwesomeIcon icon={faCopy} />}
            />
            <OptionListItem labelWidth={150} label="Paste" />
            <OptionListItem labelWidth={150} label="Export to">
              <DropContainer>
                <OptionList>
                  <OptionListItem labelWidth={100} label="Export as Excel" />
                  <OptionListItem labelWidth={100} label="Export as CSV" />
                  <OptionListItem labelWidth={100} label="Export as JSON" />
                  <OptionListItem labelWidth={100} label="Export as Excel" />
                  <OptionListItem labelWidth={100} label="Export as CSV" />
                  <OptionListItem labelWidth={100} label="Export as JSON" />
                  <OptionListItem labelWidth={100} label="Export as Excel" />
                  <OptionListItem labelWidth={100} label="Export as CSV" />
                  <OptionListItem labelWidth={100} label="Export as JSON" />
                </OptionList>
              </DropContainer>
            </OptionListItem>
            <OptionListItem labelWidth={150} label="Import from" />
            <OptionListItem labelWidth={150} label="Beautify SQL Code" />
          </OptionList>
        </DropContainer>
      </div>
    </StorybookContainer>
  );
}

const meta = {
  title: 'Components/OptionList',
  component: StoryPage,
  tags: ['autodocs'],
} satisfies Meta<typeof StoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OptionListStory: Story = {
  args: {},
};
