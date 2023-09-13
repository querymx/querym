import { PropsWithChildren, useMemo } from 'react';
import styles from './styles.module.scss';

interface LayoutFixedProps {
  shadowTop?: boolean;
  shadowBottom?: boolean;
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
}

Layout.Grow = function LayoutGrow({ children }: PropsWithChildren) {
  return (
    <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
};

Layout.Fixed = function LayoutFixed({
  children,
  shadowBottom,
  shadowTop,
}: PropsWithChildren<LayoutFixedProps>) {
  const className = useMemo(() => {
    return [
      shadowBottom ? styles.shadowBottom : undefined,
      shadowTop ? styles.shadowTop : undefined,
    ]
      .filter(Boolean)
      .join();
  }, [shadowBottom, shadowTop]);

  return (
    <div className={className} style={{ flexShrink: 0, flexGrow: 0 }}>
      {children}
    </div>
  );
};
