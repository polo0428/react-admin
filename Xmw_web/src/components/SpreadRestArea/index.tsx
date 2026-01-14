
import clsx from 'clsx';
import { ReactNode, useCallback, useEffect, useRef } from 'react';

const SpreadRestArea = ({
  className,
  children,
  marginBottom = 32,
  fixHeight,
  maxHeight,
  marginTop = 0,
}: {
  className?: string;
  children?: ReactNode;
  marginBottom?: number;
  fixHeight?: boolean;
  maxHeight?: boolean;
  marginTop?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const calc = useCallback(() => {
    if (!ref.current) return;
    const rectInfo = ref.current.getBoundingClientRect();
    if (!rectInfo) return;
    const restHeight =
      window.innerHeight - rectInfo.top - marginBottom - marginTop;
    if (maxHeight) {
      ref.current.style.maxHeight = restHeight + 'px';
    } else if (fixHeight) {
      ref.current.style.height = restHeight + 'px';
    } else {
      ref.current.style.minHeight = restHeight + 'px';
    }
  }, [marginBottom, marginTop, maxHeight, fixHeight]);

  useEffect(() => {
    const handleResize = () => {
      calc();
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calc]);

  return (
    <>
      <div
        className={clsx(className)}
        style={{ borderRadius: '12px' }}
        ref={ref}
      >
        {children}
      </div>
    </>
  );
};

export default SpreadRestArea;
