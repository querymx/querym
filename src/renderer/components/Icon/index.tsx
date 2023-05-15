import iconMore from './more.svg';
import iconMySql from './mysql.svg';
import iconDown from './down.svg';
import iconRight from './right.svg';
import iconTable from './table2.png';
import iconClose from './close.svg';

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
