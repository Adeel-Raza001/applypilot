'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AiProgress({ steps }: { steps: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => Math.min(i + 1, steps.length - 1)),
      3500,
    );
    return () => clearInterval(id);
  }, [steps.length]);

  const last = index === steps.length - 1;

  return (
    <div className="mt-4 rounded-lg bg-brand/5 p-4">
      <div className="flex items-center gap-3">
        <Loader2 size={18} className="animate-spin text-brand" />
        <p className="text-sm font-medium text-fg">{steps[index]}</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand transition-all duration-700"
          style={{ width: `${((index + 1) / steps.length) * 100}%` }}
        />
      </div>
      {last && (
        <p className="mt-2 text-xs text-muted">
          Still working. The AI can be slow when it is busy, please wait.
        </p>
      )}
    </div>
  );
}