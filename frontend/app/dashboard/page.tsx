'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AddApplicationForm from '@/components/AddApplicationForm';
import KanbanBoard from '@/components/KanbanBoard';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import {
  deleteApplication,
  listApplications,
  updateApplicationStatus,
} from '@/lib/applications';
import { Application, ApplicationStatus } from '@/lib/types';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const handleError = useCallback(
    (err: unknown) => {
      // Token expire ho gaya to login par bhejo
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Something went wrong');
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

  async function handleStatusChange(id: number, status: ApplicationStatus) {
    setError('');
    const previous = applications;
    // Optimistic update: UI foran badlo
    setApplications((list) =>
      list.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    try {
      await updateApplicationStatus(id, status);
    } catch (err) {
      setApplications(previous); // fail hua to purani state wapas
      handleError(err);
    }
  }

  async function handleDelete(id: number) {
    setError('');
    const previous = applications;
    setApplications((list) => list.filter((a) => a.id !== id));
    try {
      await deleteApplication(id);
    } catch (err) {
      setApplications(previous);
      handleError(err);
    }
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ApplyPilot</h1>
          <p className="text-sm text-gray-600">Welcome, {user.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? 'Close' : 'Add application'}
          </button>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <AddApplicationForm
          onCreated={(created) => setApplications((list) => [created, ...list])}
          onClose={() => setShowForm(false)}
        />
      )}

      {fetching ? (
        <p className="text-gray-600">Loading applications...</p>
      ) : applications.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-700">No applications yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Click &quot;Add application&quot; to track your first job.
          </p>
        </div>
      ) : (
        <KanbanBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}