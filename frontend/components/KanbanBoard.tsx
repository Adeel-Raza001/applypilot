'use client';

import { Inbox } from 'lucide-react';
import { Application, ApplicationStatus, STATUSES } from '@/lib/types';
import ApplicationCard from './ApplicationCard';

type Props = {
  applications: Application[];
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
};

const dotColor: Record<ApplicationStatus, string> = {
  WISHLIST: 'bg-slate-400',
  APPLIED: 'bg-sky-500',
  INTERVIEW: 'bg-amber-500',
  OFFER: 'bg-emerald-500',
  REJECTED: 'bg-rose-500',
};

export default function KanbanBoard({
  applications,
  onStatusChange,
  onDelete,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {STATUSES.map((column) => {
        const items = applications.filter((a) => a.status === column.value);
        return (
          <section key={column.value} className="rounded-xl bg-line/30 p-3">
            <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-fg">
              <span className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${dotColor[column.value]}`}
                />
                {column.label}
              </span>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                {items.length}
              </span>
            </h3>

            <div className="space-y-3">
              {items.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
              {items.length === 0 && (
                <div className="flex flex-col items-center gap-1 py-6 text-muted">
                  <Inbox size={22} />
                  <p className="text-xs">Nothing here yet</p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}