import {
  faPlugCircleXmark,
  faShield,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useConnection } from 'renderer/App';
import { ChildWindow } from 'renderer/components/ChildWindow';
import Keybindings from 'renderer/components/Keybindings';
import Toolbar from 'renderer/components/Toolbar';
import { useDatabaseSetting } from 'renderer/contexts/DatabaseSettingProvider';

export default function MainToolbar() {
  const { disconnect } = useConnection();
  const { protectionLevel, setProductionLevel } = useDatabaseSetting();
  const [keybindingsWindowOpen, setKeybindingsWindowOpen] =
    React.useState(false);

  return (
    <React.Fragment>
      <Toolbar shadow>
        <Toolbar.Item
          text="Disconnect"
          icon={<FontAwesomeIcon icon={faPlugCircleXmark} />}
          onClick={() => {
            disconnect();
          }}
        />
        <Toolbar.ContextMenu
          text={`Protection: Level ${protectionLevel}`}
          icon={<FontAwesomeIcon icon={faShield} />}
          items={[
            {
              text: 'Level 0 - Send queries without any warning',
              tick: protectionLevel === 0,
              onClick: () => setProductionLevel(0),
            },
            {
              text: 'Level 1 - Warn before send queries except SELECT',
              tick: protectionLevel === 1,
              onClick: () => setProductionLevel(1),
            },
            {
              text: 'Level 2 - Warn before send queries',
              tick: protectionLevel === 2,
              onClick: () => setProductionLevel(2),
            },
          ]}
        />
        <Toolbar.ContextMenu
          text="Settings"
          icon={<FontAwesomeIcon icon={faGear} />}
          items={[
            {
              text: 'Keybingings',
              onClick: () => {
                console.log('first');
                setKeybindingsWindowOpen(true);
              },
            },
          ]}
        />
      </Toolbar>

      {keybindingsWindowOpen && (
        <ChildWindow
          options="width=600, height=600, alwaysOnTop=true"
          onClosed={() => setKeybindingsWindowOpen(false)}
        >
          <Keybindings />
        </ChildWindow>
      )}
    </React.Fragment>
  );
}
