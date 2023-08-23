import { PropsWithChildren, ReactNode } from 'react';
import styles from './styles.module.scss';
import { ContextMenuItemProps } from '../ContextMenu';
import { useContextMenu } from 'renderer/contexts/ContextMenuProvider';

interface ToolbarItemProps {
  icon?: ReactNode;
  text?: string;
  badge?: number;
  disabled?: boolean;
  onClick?: () => void;
}

export default function Toolbar({
  children,
  shadow,
}: PropsWithChildren<{ shadow?: boolean }>) {
  return (
    <div
      className={shadow ? `${styles.toolbar} ${styles.shadow}` : styles.toolbar}
    >
      <ul>{children}</ul>
    </div>
  );
}

Toolbar.Item = function ({
  icon,
  text,
  onClick,
  badge,
  disabled,
}: ToolbarItemProps) {
  return (
    <li
      className={styles.button}
      onClick={disabled ? undefined : onClick}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {text && <span>{text}</span>}
      {badge ? <span className={styles.badge}>{badge}</span> : <></>}
    </li>
  );
};

Toolbar.Filler = function () {
  return <li className={styles.filler}></li>;
};

Toolbar.Text = function ({ children }: PropsWithChildren) {
  return <li>{children}</li>;
};

Toolbar.Separator = function () {
  return <li className={styles.separator} />;
};

interface ToolbarTextFieldProps {
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
}

Toolbar.TextField = function ({
  placeholder,
  value,
  onChange,
}: ToolbarTextFieldProps) {
  return (
    <li className={styles.textfield}>
      <input
        spellCheck={false}
        autoCorrect="off"
        autoComplete="off"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (onChange) onChange(e.currentTarget.value);
        }}
      />
    </li>
  );
};

Toolbar.ContextMenu = function ({
  items,
  icon,
  text,
}: {
  items: ContextMenuItemProps[];
  text: string;
  icon?: ReactNode;
}) {
  const { handleClick } = useContextMenu(() => items, [items]);

  return (
    <li className={styles.button} onClick={handleClick}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{text}</span>
    </li>
  );
};
