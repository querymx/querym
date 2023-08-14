import { useCallback } from 'react';
import Stack from 'renderer/components/Stack';
import Heading from 'renderer/components/Typo/Heading';
import imageLogo from './../../../../assets/icon.svg';
import pkg from '../../../../package.json';
import Contributors from './Contributors';
import Button from 'renderer/components/Button';
import ButtonGroup from 'renderer/components/ButtonGroup';

export default function WelcomeScreen() {
  const onGithubClicked = useCallback(() => {
    window.electron.openExternal('https://github.com/invisal/query-master');
  }, []);

  const onReportIssueClicked = useCallback(() => {
    window.electron.openExternal(
      'https://github.com/invisal/query-master/issues'
    );
  }, []);

  return (
    <Stack padding vertical full>
      <img src={imageLogo} alt="" width={150} height={150} />

      <Heading>Query Master v{pkg.version}</Heading>

      <p>
        <strong>Query Master</strong> is a complete free open-source cross
        platform database graphical client. Please support us on:
      </p>

      <p>
        <ButtonGroup>
          <Button primary onClick={onGithubClicked}>
            Github
          </Button>
          <Button destructive onClick={onReportIssueClicked}>
            Report Issue
          </Button>
        </ButtonGroup>
      </p>

      <Contributors />
    </Stack>
  );
}
