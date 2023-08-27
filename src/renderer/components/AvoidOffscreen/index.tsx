import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export default function AvoidOffscreen({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const [computed, setComputed] = useState(false);
  const [offsetTop, setOffsetTop] = useState(0);
  const [flip, setFlip] = useState(false);

  const computePosition = useCallback(() => {
    if (ref.current) {
      const bound = ref.current.getBoundingClientRect();
      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      if (offsetTop === 0) {
        setOffsetTop(Math.min(0, viewportHeight - bound.bottom));
      }

      if (bound.width === 0) return false;

      if (!flip) {
        setFlip(bound.right > viewportWidth);
      }

      setComputed(true);
    }
  }, [ref, setOffsetTop, setFlip, flip, offsetTop, setComputed]);

  useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver(() => {
        computePosition();
      });

      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }
  }, [ref, computePosition]);

  return (
    <div
      ref={ref}
      style={{
        visibility: computed ? 'visible' : 'hidden',
        position: 'absolute',
        top: offsetTop,
        ...(flip ? { right: '100%' } : { left: '100%' }),
      }}
    >
      {children}
    </div>
  );
}
