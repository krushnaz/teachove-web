import { useEffect, useRef, useState } from 'react';

export function useReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const elementRef = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!elementRef.current || revealed) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, options || { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [revealed, options]);

  return { elementRef, revealed } as const;
}
