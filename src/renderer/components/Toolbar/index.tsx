import { PropsWithChildren, ReactNode } from 'react';
import styles from './styles.module.scss';

interface ToolbarItemProps {
  icon?: ReactNode;
  text: string;
  onClick?: () => void;
}

export default function Toolbar({ children }: PropsWithChildren<unknown>) {
  return (
    <div className={styles.toolbar}>
      <ul>{children}</ul>
    </div>
  );
}

Toolbar.Item = function ({ icon, text, onClick }: ToolbarItemProps) {
  return (
    <li onClick={onClick}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{text}</span>
    </li>
  );
};
