'use client';

import { useEffect, useState } from 'react';

function strokeClass(score: number) {
  if (score >= 70) return 'stroke-emerald-500';
  if (score >= 40) return 'stroke-amber-500';
  return 'stroke-rose-500';
}

export default function ScoreRing({ score }: { score: number }) {
  const [shown, setShown] = useState(0);

  // Mount ke baad value set karo taake CSS transition animate ho
  useEffect(() => {
    const id = setTimeout(() => setShown(score), 50);
    return () => clearTimeout(id);
  }, [score]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - shown / 100);

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-line"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${strokeClass(score)} transition-[stroke-dashoffset] duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-fg">{score}%</span>
        <span className="text-xs text-muted">match</span>
      </div>
    </div>
  );
}