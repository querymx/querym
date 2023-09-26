import styles from './styles.module.scss';
import iconMore from './more.svg';
import iconMySql from './mysql.svg';
import iconPostgre from './postgresql.svg';
import iconDown from './down.svg';
import iconRight from './right.svg';
import iconTable from './table2.png';
import iconClose from './close.svg';
import iconLightBulb from './light_bulb.svg';
import iconGreenKey from './green_key.svg';

interface IconProps {
  size?: 'sm' | 'md' | 'lg';
  followTheme?: boolean;
  inline?: boolean;
}

interface IconPropsWithPath extends IconProps {
  path: string;
}

const Icon = function Icon({
  path,
  size,
  inline,
  followTheme,
}: IconPropsWithPath) {
  const className = [];

  if (size === 'sm') {
    className.push(styles.sm);
  } else if (size === 'md') {
    className.push(styles.md);
  } else if (size === 'lg') {
    className.push(styles.lg);
  }

  if (inline) {
    className.push(styles.inline);
  }

  if (followTheme) {
    className.push(styles.followTheme);
  }

  return <img src={path} className={className.join(' ')} />;
};

export default Icon;

Icon.Down = (props: IconProps) => {
  return <Icon path={iconDown} {...props} />;
};

Icon.Right = (props: IconProps) => {
  return <Icon path={iconRight} {...props} />;
};

Icon.Table = (props: IconProps) => {
  return <Icon path={iconTable} {...props} />;
};

Icon.More = (props: IconProps) => {
  return <Icon path={iconMore} {...props} />;
};

Icon.MySql = (props: IconProps) => {
  return <Icon path={iconMySql} {...props} />;
};

Icon.PostgreSQL = (props: IconProps) => {
  return <Icon path={iconPostgre} {...props} />;
};

Icon.Close = (props: IconProps) => {
  return <Icon path={iconClose} {...props} />;
};

Icon.LightBulb = (props: IconProps) => {
  return <Icon path={iconLightBulb} {...props} />;
};

Icon.GreenKey = (props: IconProps) => {
  return <Icon path={iconGreenKey} {...props} />;
};
