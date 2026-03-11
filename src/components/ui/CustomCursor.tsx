import { useEffect, useRef, useState } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';

export function CustomCursor() {
  const { x, y } = useMousePosition();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isText, setIsText] = useState(false);
  const ringPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updateRing = () => {
      const ease = 0.12;
      ringPos.current.x += (x - ringPos.current.x) * ease;
      ringPos.current.y += (y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
      }

      rafRef.current = requestAnimationFrame(updateRing);
    };

    rafRef.current = requestAnimationFrame(updateRing);
    return () => cancelAnimationFrame(rafRef.current);
  }, [x, y]);

  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
    }
  }, [x, y]);

  useEffect(() => {
    const interactiveSelectors = 'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]';
    const textSelectors = 'input[type="text"], input[type="email"], textarea';

    const handleMouseEnter = (e: Event) => {
      const target = e.target as Element;
      if (target.matches(textSelectors)) {
        setIsText(true);
      } else {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setIsText(false);
    };

    const addListeners = () => {
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    addListeners();

    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.querySelectorAll(interactiveSelectors).forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot ${isHovering ? 'cursor-hover' : ''} ${isText ? 'cursor-text' : ''}`}
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className={`cursor-ring ${isHovering ? 'cursor-hover' : ''}`}
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
