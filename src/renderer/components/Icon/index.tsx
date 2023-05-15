import iconMore from './more.svg';
import iconMySql from './mysql.svg';
import iconDown from './down.svg';
import iconRight from './right.svg';
import iconTable from './table2.png';
import iconClose from './close.svg';
import iconLightBulb from './light_bulb.svg';
import iconGreenKey from './green_key.svg';

export default function Icon({ path }: { path: string }) {
  return <img src={path} />;
}

Icon.Down = () => {
  return <Icon path={iconDown} />;
};

Icon.Right = () => {
  return <Icon path={iconRight} />;
};

Icon.Table = () => {
  return <Icon path={iconTable} />;
};

Icon.More = () => {
  return <Icon path={iconMore} />;
};

Icon.MySql = () => {
  return <Icon path={iconMySql} />;
};

Icon.Close = () => {
  return <Icon path={iconClose} />;
};

Icon.LightBulb = () => {
  return <Icon path={iconLightBulb} />;
};

Icon.GreenKey = () => {
  return <Icon path={iconGreenKey} />;
};
