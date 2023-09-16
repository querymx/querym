import { useEffect, useState } from 'react';

export default function useBeforeClose(
  callback: () => Promise<boolean>,
  deps: unknown[] = []
) {
  const [allowedClose, setAllowedClose] = useState(false);

  useEffect(() => {
    if (allowedClose) {
      if (window.isClosing) {
        window.close();
      } else {
        window.location.reload();
      }
    } else {
      const beforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        callback().then(setAllowedClose).catch();
        e.returnValue = true;
      };

      window.addEventListener('beforeunload', beforeUnload);
      return () => window.removeEventListener('beforeunload', beforeUnload);
    }
  }, [...deps, allowedClose, setAllowedClose]);
}
