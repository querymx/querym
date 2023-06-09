import { faShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Toolbar from 'renderer/components/Toolbar';
import { useDatabaseSetting } from 'renderer/contexts/DatabaseSettingProvider';

export default function MainToolbar() {
  const { protectionLevel, setProductionLevel } = useDatabaseSetting();

  return (
    <Toolbar shadow>
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
    </Toolbar>
  );
}
