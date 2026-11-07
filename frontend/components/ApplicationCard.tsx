'use client';

import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Application, ApplicationStatus, STATUSES } from '@/lib/types';

type Props = {
  application: Application;
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
  handle?: ReactNode;
  isOverlay?: boolean;
};

function scoreClasses(score: number) {
  if (score >= 70)
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  if (score >= 40) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
}

export default function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
  handle,
  isOverlay = false,
}: Props) {
  return (
    <div
      className={`card p-3 shadow-sm transition ${
        isOverlay
          ? 'rotate-2 shadow-xl ring-2 ring-brand/40'
          : 'hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2">
        {handle}
        <div className="min-w-0 flex-1">
          <Link
            href={`/applications/${application.id}`}
            className="block truncate font-semibold text-fg hover:text-brand"
          >
            {application.company}
          </Link>
          <p className="truncate text-sm text-muted">{application.jobTitle}</p>
        </div>
        {application.matchScore !== null && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${scoreClasses(application.matchScore)}`}
          >
            {application.matchScore}%
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-muted">
        Added {new Date(application.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={application.status}
          onChange={(e) =>
            onStatusChange(application.id, e.target.value as ApplicationStatus)
          }
          className="field flex-1 py-1 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label="Delete application"
          onClick={() => {
            if (confirm(`Delete application for ${application.company}?`)) {
              onDelete(application.id);
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-rose-500 transition hover:bg-rose-500/10"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}