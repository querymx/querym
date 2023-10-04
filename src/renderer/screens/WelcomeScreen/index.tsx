import { useCallback } from 'react';
import Stack from 'renderer/components/Stack';
import Contributors from './Contributors';
import Button from 'renderer/components/Button';
import ButtonGroup from 'renderer/components/ButtonGroup';
import SetupAccountCallout from './SetupAccountCallout';

export default function WelcomeScreen() {
  const onGithubClicked = useCallback(() => {
    window.electron.openExternal('https://github.com/Querymx/Querym');
  }, []);

  const onReportIssueClicked = useCallback(() => {
    window.electron.openExternal('https://github.com/Querymx/Querym/issues');
  }, []);

  return (
    <div>
      <SetupAccountCallout />
      <div style={{ padding: '40px', maxWidth: 700 }}>
        <Stack vertical full>
          <div>
            <strong>Querym</strong> is a free, open-source, and cross-platform
            GUI tool for databases. Although this project is relatively young,
            we are ambitious in our goal to create one of the best tools
            available.
          </div>

          <div>
            <ButtonGroup>
              <Button primary onClick={onGithubClicked}>
                GitHub
              </Button>
              <Button destructive onClick={onReportIssueClicked}>
                Report Issue
              </Button>
            </ButtonGroup>
          </div>

          {window.env.env !== 'development' && <Contributors />}
        </Stack>
      </div>
    </div>
  );
}
