import { PropsWithChildren, ReactNode, useCallback } from 'react';
import styles from './styles.module.scss';
import { ContextMenuItemProps } from '../ContextMenu';
import AttachedContextMenu from '../ContextMenu/AttachedContextMenu';
import KeyboardKey from '../KeyboardKey';

interface ToolbarItemProps {
  icon?: ReactNode;
  text?: string;
  badge?: number;
  disabled?: boolean;
  onClick?: () => void;
  primary?: boolean;
  destructive?: boolean;
  keyboard?: string;
}

export default function Toolbar({
  children,
  shadow,
  shadowTop,
}: PropsWithChildren<{ shadow?: boolean; shadowTop?: boolean }>) {
  const className = [
    styles.toolbar,
    shadow ? styles.shadow : undefined,
    shadowTop ? styles.shadowTop : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
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
  destructive,
  primary,
  keyboard,
}: ToolbarItemProps) {
  const className = [
    styles.button,
    destructive ? styles.destructive : undefined,
    primary ? styles.primary : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      className={className}
      onClick={disabled ? undefined : onClick}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {icon && (
        <span
          className={styles.icon}
          style={{ marginRight: text ? '8px' : undefined }}
        >
          {icon}
        </span>
      )}
      {text && <span className={styles.text}>{text}</span>}
      {badge ? <span className={styles.badge}>{badge}</span> : <></>}
      {keyboard && <KeyboardKey name={keyboard} />}
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

Toolbar.ContextMenu = function ToolbarContextMenu({
  items,
  icon,
  text,
}: {
  items: ContextMenuItemProps[];
  text: string;
  icon?: ReactNode;
}) {
  const activator = useCallback(() => {
    return (
      <li className={styles.button}>
        {icon && (
          <span
            className={styles.icon}
            style={{ marginRight: text ? '8px' : undefined }}
          >
            {icon}
          </span>
        )}
        <span>{text}</span>
      </li>
    );
  }, [text]);

  return <AttachedContextMenu items={items} activator={activator} />;
};
