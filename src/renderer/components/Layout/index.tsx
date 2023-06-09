import { PropsWithChildren } from 'react';

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

Layout.Grow = function ({ children }: PropsWithChildren) {
  return <div style={{ flexGrow: 1, position: 'relative' }}>{children}</div>;
};

Layout.Fixed = function ({ children }: PropsWithChildren) {
  return <div style={{ flexShrink: 0, flexGrow: 0 }}>{children}</div>;
};
