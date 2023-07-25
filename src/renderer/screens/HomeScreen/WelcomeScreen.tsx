import Stack from 'renderer/components/Stack';
import Heading from 'renderer/components/Typo/Heading';
import imageLogo from './../../../../assets/icon.svg';
import pkg from './../../../../package.json';
import { MouseEvent } from 'react';

export default function WelcomeScreen() {

  const handleOnClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.electron.openExternal("https://github.com/invisal/query-master");
  }

  return (
    <Stack padding vertical full center>
      <img src={imageLogo} alt="" width={150} height={150} />

      <Heading>Query Master v{pkg.version}</Heading>

      <p>
        <strong>Query Master</strong> is a complete free open-source cross
        platform database graphical client.
      </p>

      <p>Please support us on <a href="" onClick={handleOnClick}>Github</a></p>
    </Stack>
  );
}
