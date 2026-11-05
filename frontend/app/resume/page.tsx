'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { getResume, saveResume } from '@/lib/resume';

export default function ResumePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getResume()
      .then((r) => setContent(r.content))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not load resume');
      })
      .finally(() => setFetching(false));
  }, [user, logout, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await saveResume(content.trim());
      setMessage('Resume saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save resume');
    } finally {
      setSaving(false);
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
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link href="/dashboard" className="text-sm text-blue-600 underline">
        &larr; Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-gray-900">My resume</h1>
      <p className="mt-1 text-sm text-gray-600">
        Paste your CV as plain text. The AI uses this to score jobs and write
        cover letters, so include your skills, projects and education. Leave
        out your phone number and address.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {fetching ? (
        <p className="mt-4 text-gray-600">Loading resume...</p>
      ) : (
        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <textarea
            className="h-96 w-full rounded border border-gray-300 p-3 text-gray-900"
            placeholder="Paste your resume text here (minimum 20 characters)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            minLength={20}
            maxLength={20000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {content.length} / 20000
            </span>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save resume'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}