'use client';

import { Plus, Rocket, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AddApplicationForm from '@/components/AddApplicationForm';
import KanbanBoard from '@/components/KanbanBoard';
import { DashboardSkeleton, PageLoader } from '@/components/Skeleton';
import StatsCards from '@/components/StatsCards';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import {
  deleteApplication,
  listApplications,
  updateApplicationStatus,
} from '@/lib/applications';
import { Application, ApplicationStatus, STATUSES } from '@/lib/types';

type Filter = 'ALL' | ApplicationStatus;

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace('/login');
        toast.error('Session expired. Please login again.');
        return;
      }
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    },
    [logout, router],
  );

  const load = useCallback(async () => {
    try {
      setApplications(await listApplications());
    } catch (err) {
      handleError(err);
    } finally {
      setFetching(false);
    }
  }, [handleError]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter(
      (a) =>
        (filter === 'ALL' || a.status === filter) &&
        (!q ||
          a.company.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q)),
    );
  }, [applications, query, filter]);

  async function handleStatusChange(id: number, status: ApplicationStatus) {
    const previous = applications;
    setApplications((list) =>
      list.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    try {
      await updateApplicationStatus(id, status);
      const label = STATUSES.find((s) => s.value === status)?.label ?? status;
      toast.success(`Moved to ${label}`);
    } catch (err) {
      setApplications(previous);
      handleError(err);
    }
  }

  async function handleDelete(id: number) {
    const previous = applications;
    setApplications((list) => list.filter((a) => a.id !== id));
    try {
      await deleteApplication(id);
      toast.success('Application deleted');
    } catch (err) {
      setApplications(previous);
      handleError(err);
    }
  }

  if (loading || !user) return <PageLoader />;

  const firstName = user.name.split(' ')[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg">Hi, {firstName}</h1>
          <p className="text-sm text-muted">
            Track every application in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary"
        >
          <Plus size={16} />
          {showForm ? 'Close' : 'Add application'}
        </button>
      </div>

      {fetching ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatsCards applications={applications} />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                className="field pl-9"
                placeholder="Search company or role"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[{ value: 'ALL' as Filter, label: 'All' }, ...STATUSES].map(
                (s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFilter(s.value as Filter)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      filter === s.value
                        ? 'border-brand bg-brand text-brand-fg'
                        : 'border-line text-muted hover:text-fg'
                    }`}
                  >
                    {s.label}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mt-6">
            {showForm && (
              <AddApplicationForm
                onCreated={(created) =>
                  setApplications((list) => [created, ...list])
                }
                onClose={() => setShowForm(false)}
              />
            )}

            {applications.length === 0 && !showForm ? (
              <div className="card flex flex-col items-center gap-3 border-dashed p-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Rocket size={24} />
                </span>
                <p className="font-medium text-fg">No applications yet</p>
                <p className="text-sm text-muted">
                  Add your first job to start tracking and get an AI match score.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  <Plus size={16} />
                  Add application
                </button>
              </div>
            ) : (
              <KanbanBoard
                applications={visible}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}