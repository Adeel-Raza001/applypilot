'use client';

import { Application, ApplicationStatus, STATUSES } from '@/lib/types';

type Props = {
  application: Application;
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
};

function scoreClasses(score: number) {
  if (score >= 70) return 'bg-green-100 text-green-800';
  if (score >= 40) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export default function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">
            {application.company}
          </p>
          <p className="truncate text-sm text-gray-600">
            {application.jobTitle}
          </p>
        </div>
        {application.matchScore !== null && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${scoreClasses(application.matchScore)}`}
          >
            {application.matchScore}%
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Added {new Date(application.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={application.status}
          onChange={(e) =>
            onStatusChange(application.id, e.target.value as ApplicationStatus)
          }
          className="flex-1 rounded border border-gray-300 bg-white p-1 text-sm text-gray-900"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (confirm(`Delete application for ${application.company}?`)) {
              onDelete(application.id);
            }
          }}
          className="rounded border border-red-200 px-2 py-1 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}