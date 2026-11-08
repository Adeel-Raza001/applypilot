'use client';

import {
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AiProgress from '@/components/AiProgress';
import ScoreRing from '@/components/ScoreRing';
import { PageLoader, Skeleton } from '@/components/Skeleton';
import Typewriter from '@/components/Typewriter';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { analyzeApplication, generateCoverLetter } from '@/lib/ai';
import {
  getApplication,
  updateApplication,
  updateApplicationStatus,
} from '@/lib/applications';
import { getResume } from '@/lib/resume';
import { Application, ApplicationStatus, STATUSES } from '@/lib/types';

const ANALYZE_STEPS = [
  'Reading your resume...',
  'Reading the job description...',
  'Comparing skills...',
  'Calculating your match...',
];

const LETTER_STEPS = [
  'Reading your resume...',
  'Studying the role...',
  'Drafting your letter...',
  'Polishing the wording...',
];

function ApplicationDetail() {
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
  const [animateLetter, setAnimateLetter] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

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
        setNotes(app.notes ?? '');
        setResumeEmpty(!resume.content.trim());
      })
      .catch(handleError)
      .finally(() => setFetching(false));
  }, [user, id, handleError]);

  async function handleAnalyze() {
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
      toast.success('Match score updated');
    } catch (err) {
      handleError(err);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCoverLetter() {
    setWriting(true);
    try {
      const result = await generateCoverLetter(id);
      setAnimateLetter(true);
      setApplication((a) =>
        a ? { ...a, coverLetter: result.coverLetter } : a,
      );
      toast.success('Cover letter ready');
    } catch (err) {
      handleError(err);
    } finally {
      setWriting(false);
    }
  }

  async function handleStatusChange(status: ApplicationStatus) {
    if (!application) return;
    const previous = application;
    setApplication({ ...application, status });
    try {
      await updateApplicationStatus(application.id, status);
      const label = STATUSES.find((s) => s.value === status)?.label ?? status;
      toast.success(`Moved to ${label}`);
    } catch (err) {
      setApplication(previous);
      handleError(err);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      const updated = await updateApplication(id, { notes });
      setApplication((a) => (a ? { ...a, notes: updated.notes } : a));
      toast.success('Notes saved');
    } catch (err) {
      handleError(err);
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleCopy() {
    if (!application?.coverLetter) return;
    try {
      await navigator.clipboard.writeText(application.coverLetter);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the text and copy it manually.');
    }
  }

  if (loading || !user) return <PageLoader />;

  const busy = analyzing || writing;
  const notesChanged = (application?.notes ?? '') !== notes;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      {fetching ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-40" />
          <Skeleton className="h-48" />
        </div>
      ) : !application ? (
        <div className="card mt-6 p-8 text-center">
          <p className="font-medium text-fg">Application not found</p>
          <p className="mt-1 text-sm text-muted">
            It may have been deleted, or it belongs to another account.
          </p>
        </div>
      ) : (
        <>
          <header className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-fg">
                {application.company.charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="text-2xl font-bold text-fg">
                  {application.company}
                </h1>
                <p className="text-sm text-muted">{application.jobTitle}</p>
              </div>
            </div>
            <select
              value={application.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as ApplicationStatus)
              }
              className="field w-auto"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </header>

          {resumeEmpty && (
            <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
              Save your resume first to use the AI features.{' '}
              <Link href="/resume" className="font-medium underline">
                Go to resume
              </Link>
            </p>
          )}

          <section className="card mt-6 p-4">
            <h2 className="font-semibold text-fg">Job description</h2>
            <p className="mt-2 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm text-muted">
              {application.jobDescription}
            </p>
          </section>

          <section className="card mt-6 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-fg">Resume match</h2>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={busy || resumeEmpty}
                className="btn-primary"
              >
                {application.matchScore !== null ? (
                  <RefreshCw size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                {analyzing
                  ? 'Analyzing...'
                  : application.matchScore !== null
                    ? 'Analyze again'
                    : 'Analyze'}
              </button>
            </div>

            {analyzing && <AiProgress steps={ANALYZE_STEPS} />}

            {!analyzing && application.matchScore !== null && (
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <ScoreRing score={application.matchScore} />
                <div className="min-w-0 flex-1">
                  {summary && <p className="text-sm text-fg">{summary}</p>}
                  {application.missingSkills.length > 0 && (
                    <div className={summary ? 'mt-3' : ''}>
                      <p className="text-sm font-medium text-fg">
                        Missing skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {application.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-700 dark:text-rose-400"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!analyzing && application.matchScore === null && (
              <p className="mt-3 text-sm text-muted">
                Click Analyze to see how well your resume fits this job.
              </p>
            )}
          </section>

          <section className="card mt-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-fg">Cover letter</h2>
              <div className="flex gap-2">
                {application.coverLetter && !writing && (
                  <button type="button" onClick={handleCopy} className="btn-ghost">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCoverLetter}
                  disabled={busy || resumeEmpty}
                  className="btn-primary"
                >
                  <Sparkles size={16} />
                  {writing
                    ? 'Writing...'
                    : application.coverLetter
                      ? 'Regenerate'
                      : 'Generate'}
                </button>
              </div>
            </div>

            {writing && <AiProgress steps={LETTER_STEPS} />}

            {!writing && application.coverLetter && (
              <>
                <Typewriter
                  text={application.coverLetter}
                  animate={animateLetter}
                  className="mt-4 rounded-lg bg-line/30 p-4 text-sm text-fg"
                />
                <p className="mt-2 text-xs text-muted">
                  AI can make mistakes. Read the letter and check every claim
                  before you send it.
                </p>
              </>
            )}

            {!writing && !application.coverLetter && (
              <p className="mt-3 text-sm text-muted">No cover letter yet.</p>
            )}
          </section>

          <section className="card mt-6 p-4">
            <h2 className="font-semibold text-fg">Notes</h2>
            <textarea
              className="field mt-3 h-28"
              placeholder="Interview dates, contacts, follow-up reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={5000}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes || !notesChanged}
                className="btn-primary"
              >
                <Save size={16} />
                {savingNotes ? 'Saving...' : 'Save notes'}
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default function ApplicationDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ApplicationDetail />
    </Suspense>
  );
}