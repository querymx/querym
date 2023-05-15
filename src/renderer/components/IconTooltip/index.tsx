import {
  ReactElement,
  PropsWithChildren,
  useState,
  useEffect,
  useRef,
} from 'react';
import styles from './styles.module.css';

interface IconTooltip {
  icon: ReactElement;
}

export default function IconTooltip({
  icon,
  children,
}: PropsWithChildren<IconTooltip>) {
  const wrappedRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) {
      const onClick = (e: MouseEvent) => {
        if (
          wrappedRef.current &&
          !wrappedRef.current.contains(e.target as Node)
        ) {
          setShow(false);
        }
      };

      document.addEventListener('click', onClick);
      return () => document.removeEventListener('click', onClick);
    }
  }, [setShow, show, wrappedRef]);

  return (
    <div
      ref={wrappedRef}
      className={styles.tooltip}
      onClick={() => {
        setShow(true);
      }}
    >
      {icon}
      {show && <div className={styles.content}>{children}</div>}
    </div>
  );
}
