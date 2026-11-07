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
  if (score >= 70)
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  if (score >= 40) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
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
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  const busy = analyzing || writing;

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link href="/dashboard" className="text-sm text-brand underline">
        &larr; Back to dashboard
      </Link>

      {fetching ? (
        <p className="mt-4 text-muted">Loading application...</p>
      ) : !application ? (
        <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error || 'Application not found.'}
        </p>
      ) : (
        <>
          <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-fg">
                {application.company}
              </h1>
              <p className="text-muted">{application.jobTitle}</p>
            </div>
            <select
              value={application.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as ApplicationStatus)
              }
              className="rounded border border-line bg-surface p-2 text-sm text-fg"
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

          <section className="mt-6 rounded-xl border border-line bg-surface p-4">
            <h2 className="font-semibold text-fg">Job description</h2>
            <p className="mt-2 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm text-fg">
              {application.jobDescription}
            </p>
          </section>

          <section className="mt-6 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-fg">Resume match</h2>
              <button
                onClick={handleAnalyze}
                disabled={busy || resumeEmpty}
                className="rounded bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:opacity-90 disabled:opacity-60"
              >
                {analyzing
                  ? 'Analyzing...'
                  : application.matchScore !== null
                    ? 'Analyze again'
                    : 'Analyze'}
              </button>
            </div>

            {analyzing && (
              <p className="mt-3 text-sm text-muted">
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
                  <p className="mt-3 text-sm text-fg">{summary}</p>
                )}

                {application.missingSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-fg">
                      Missing skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {application.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-line/40 px-3 py-1 text-xs text-fg"
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

          <section className="mt-6 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-fg">Cover letter</h2>
              <div className="flex gap-2">
                {application.coverLetter && (
                  <button
                    onClick={handleCopy}
                    className="rounded border border-line px-3 py-2 text-sm text-fg hover:bg-line/40"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
                <button
                  onClick={handleCoverLetter}
                  disabled={busy || resumeEmpty}
                  className="rounded bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:opacity-90 disabled:opacity-60"
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
              <p className="mt-3 text-sm text-muted">
                This can take up to a minute when the AI is busy.
              </p>
            )}

            {application.coverLetter ? (
              <>
                <p className="mt-3 whitespace-pre-wrap rounded bg-line/30 p-3 text-sm text-fg">
                  {application.coverLetter}
                </p>
                <p className="mt-2 text-xs text-muted">
                  AI can make mistakes. Read the letter and check every claim
                  before you send it.
                </p>
              </>
            ) : (
              !writing && (
                <p className="mt-3 text-sm text-muted">
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