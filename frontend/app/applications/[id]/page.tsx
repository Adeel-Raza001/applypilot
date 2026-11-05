'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { analyzeApplication, generateCoverLetter } from '@/lib/ai';
import { getApplication, updateApplicationStatus } from '@/lib/applications';
import { getResume } from '@/lib/resume';
import { Application, ApplicationStatus, STATUSES } from '@/lib/types';

function scoreClasses(score: number) {
  if (score >= 70) return 'bg-green-100 text-green-800';
  if (score >= 40) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export default function ApplicationDetailPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [application, setApplication] = useState<Application | null>(null);
  const [resumeEmpty, setResumeEmpty] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [writing, setWriting] = useState(false);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Something went wrong');
    },
    [logout, router],
  );

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    if (Number.isNaN(id)) {
      setFetching(false);
      return;
    }
    Promise.all([getApplication(id), getResume()])
      .then(([app, resume]) => {
        setApplication(app);
        setResumeEmpty(!resume.content.trim());
      })
      .catch(handleError)
      .finally(() => setFetching(false));
  }, [user, id, handleError]);

  async function handleAnalyze() {
    setError('');
    setAnalyzing(true);
    try {
      const result = await analyzeApplication(id);
      setSummary(result.summary);
      setApplication((a) =>
        a
          ? {
              ...a,
              matchScore: result.matchScore,
              missingSkills: result.missingSkills,
            }
          : a,
      );
    } catch (err) {
      handleError(err);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCoverLetter() {
    setError('');
    setWriting(true);
    try {
      const result = await generateCoverLetter(id);
      setApplication((a) =>
        a ? { ...a, coverLetter: result.coverLetter } : a,
      );
    } catch (err) {
      handleError(err);
    } finally {
      setWriting(false);
    }
  }

  async function handleStatusChange(status: ApplicationStatus) {
    if (!application) return;
    setError('');
    const previous = application;
    setApplication({ ...application, status });
    try {
      await updateApplicationStatus(application.id, status);
    } catch (err) {
      setApplication(previous);
      handleError(err);
    }
  }

  async function handleCopy() {
    if (!application?.coverLetter) return;
    try {
      await navigator.clipboard.writeText(application.coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy. Select the text and copy it manually.');
    }
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  const busy = analyzing || writing;

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link href="/dashboard" className="text-sm text-blue-600 underline">
        &larr; Back to dashboard
      </Link>

      {fetching ? (
        <p className="mt-4 text-gray-600">Loading application...</p>
      ) : !application ? (
        <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error || 'Application not found.'}
        </p>
      ) : (
        <>
          <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {application.company}
              </h1>
              <p className="text-gray-600">{application.jobTitle}</p>
            </div>
            <select
              value={application.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as ApplicationStatus)
              }
              className="rounded border border-gray-300 bg-white p-2 text-sm text-gray-900"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </header>

          {error && (
            <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {resumeEmpty && (
            <p className="mt-4 rounded bg-yellow-50 p-3 text-sm text-yellow-800">
              Save your resume first to use the AI features.{' '}
              <Link href="/resume" className="font-medium underline">
                Go to resume
              </Link>
            </p>
          )}

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-gray-900">Job description</h2>
            <p className="mt-2 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
              {application.jobDescription}
            </p>
          </section>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">Resume match</h2>
              <button
                onClick={handleAnalyze}
                disabled={busy || resumeEmpty}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {analyzing
                  ? 'Analyzing...'
                  : application.matchScore !== null
                    ? 'Analyze again'
                    : 'Analyze'}
              </button>
            </div>

            {analyzing && (
              <p className="mt-3 text-sm text-gray-500">
                This can take up to a minute when the AI is busy.
              </p>
            )}

            {application.matchScore !== null && (
              <div className="mt-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${scoreClasses(application.matchScore)}`}
                >
                  {application.matchScore}% match
                </span>

                {summary && (
                  <p className="mt-3 text-sm text-gray-700">{summary}</p>
                )}

                {application.missingSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">
                      Missing skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {application.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">Cover letter</h2>
              <div className="flex gap-2">
                {application.coverLetter && (
                  <button
                    onClick={handleCopy}
                    className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
                <button
                  onClick={handleCoverLetter}
                  disabled={busy || resumeEmpty}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {writing
                    ? 'Writing...'
                    : application.coverLetter
                      ? 'Regenerate'
                      : 'Generate'}
                </button>
              </div>
            </div>

            {writing && (
              <p className="mt-3 text-sm text-gray-500">
                This can take up to a minute when the AI is busy.
              </p>
            )}

            {application.coverLetter ? (
              <>
                <p className="mt-3 whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm text-gray-800">
                  {application.coverLetter}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  AI can make mistakes. Read the letter and check every claim
                  before you send it.
                </p>
              </>
            ) : (
              !writing && (
                <p className="mt-3 text-sm text-gray-500">
                  No cover letter yet.
                </p>
              )
            )}
          </section>
        </>
      )}
    </main>
  );
}