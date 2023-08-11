import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  onClosed?: () => void;
  children: React.ReactNode;
  options?: string;
};

export function ChildWindow({ onClosed, children, options }: Props) {
  const newWindow = useMemo(() => window.open('', '', options), [options]);

  useEffect(() => {
    if (!newWindow) return;
    newWindow.onunload = () => {
      onClosed?.();
    };
    return () => newWindow.close();
  }, [newWindow, onClosed]);

  if (!newWindow) return null;

  return createPortal(<div>{children}</div>, newWindow.document.body);
}
