import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAppFeature } from 'renderer/contexts/AppFeatureProvider';

type Props = {
  onClosed?: () => void;
  children: React.ReactNode;
  options?: string;
};

export const ChildWindowContext = React.createContext<Window | null>(null);

export function ChildWindow({ onClosed, children, options }: Props) {
  const childWindow = useMemo(() => window.open('', '', options), [options]);
  const { theme } = useAppFeature();

  useEffect(() => {
    if (!childWindow) return;
    childWindow.onunload = () => {
      onClosed?.();
    };
    return () => childWindow.close();
  }, [childWindow, onClosed]);

  if (!childWindow) return null;

  childWindow.document.title = 'QueryMaster - Keybindings';
  childWindow.document.body.classList.add(theme);
  copyStyles(window.document, childWindow.document);

  return createPortal(
    <ChildWindowContext.Provider value={childWindow}>
      {children}
    </ChildWindowContext.Provider>,
    childWindow.document.body
  );
}

function copyStyles(sourceDoc: Document, targetDoc: Document) {
  Array.from(sourceDoc.styleSheets).forEach((styleSheet) => {
    if (styleSheet.href) {
      // true for stylesheets loaded from a URL
      const newLinkEl = sourceDoc.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    } else {
      const newStyleEl = sourceDoc.createElement('style');
      newStyleEl.sheet?.insertRule(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        styleSheet as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newStyleEl.sheet as any).length
      );

      Array.from(styleSheet.cssRules).forEach((cssRule) => {
        newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
      });

      targetDoc.head.appendChild(newStyleEl);
    }
  });
}
