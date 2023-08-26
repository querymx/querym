import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export default function AvoidOffscreen({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);

  const [offsetTop, setOffsetTop] = useState(0);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [flip, setFlip] = useState(false);

  const computePosition = useCallback(() => {
    if (ref.current) {
      const bound = ref.current.getBoundingClientRect();
      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      setOffsetTop(Math.min(0, viewportHeight - bound.bottom));

      if (!flip) {
        setFlip(bound.right > viewportWidth);
        if (
          ref.current.parentElement &&
          ref.current.parentElement.style.position === 'fixed'
        ) {
          setOffsetLeft(bound.width);
        }
      }
    }
  }, [ref, setOffsetTop, setFlip, offsetLeft, flip]);

  useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver(() => {
        computePosition();
      });

      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }
  }, [ref, computePosition]);

  console.log(flip, offsetTop);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: offsetTop,
        ...(flip
          ? offsetLeft
            ? { right: '100%', transform: `translateX(-${offsetLeft}px)` }
            : { right: '100%' }
          : { left: '100%' }),
      }}
    >
      {children}
    </div>
  );
}
