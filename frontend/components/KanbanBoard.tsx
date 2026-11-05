'use client';

import { Application, ApplicationStatus, STATUSES } from '@/lib/types';
import ApplicationCard from './ApplicationCard';

type Props = {
  applications: Application[];
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
};

export default function KanbanBoard({
  applications,
  onStatusChange,
  onDelete,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {STATUSES.map((column) => {
        const items = applications.filter((a) => a.status === column.value);
        return (
          <section
            key={column.value}
            className="rounded-xl bg-gray-100 p-3"
          >
            <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-700">
              {column.label}
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">
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
                <p className="py-4 text-center text-xs text-gray-400">
                  No applications
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}