import { PropsWithChildren } from 'react';
import styles from './styles.module.scss';

export default function SideMenu({ children }: PropsWithChildren) {
  return (
    <div className={styles.sideMenu}>
      <ul>{children}</ul>
    </div>
  );
}

interface SideMenuItemProps {
  text: string;
  onClick?: () => void;
}

SideMenu.Item = (props: SideMenuItemProps) => {
  return <li onClick={props.onClick}>{props.text}</li>;
};
