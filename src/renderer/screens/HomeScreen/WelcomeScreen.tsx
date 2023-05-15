import Stack from 'renderer/components/Stack';
import Heading from 'renderer/components/Typo/Heading';
import pkg from './../../../../package.json';

export default function WelcomeScreen() {
  return (
    <Stack padding vertical full center>
      <Heading>Query Master v{pkg.version}</Heading>

      <p>
        <strong>Query Master</strong> is a complete free open-source cross
        platform database graphical client.
      </p>

      <p>Please support us on Github</p>
    </Stack>
  );
}
