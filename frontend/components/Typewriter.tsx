'use client';

import { useEffect, useState } from 'react';

type Props = { text: string; animate: boolean; className?: string };

export default function Typewriter({ text, animate, className = '' }: Props) {
  const [count, setCount] = useState(animate ? 0 : text.length);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!animate || reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return Math.min(c + 6, text.length);
      });
    }, 16);
    return () => clearInterval(id);
  }, [text, animate]);

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {text.slice(0, count)}
      {count < text.length && <span className="animate-pulse">|</span>}
    </div>
  );
}