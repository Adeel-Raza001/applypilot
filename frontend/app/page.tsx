'use client';

import {
  ArrowRight,
  FileUp,
  Gauge,
  KanbanSquare,
  Lock,
  PenLine,
  Rocket,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import ScoreRing from '@/components/ScoreRing';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

const features = [
  {
    icon: KanbanSquare,
    title: 'Kanban job board',
    text: 'Drag every application through Wishlist, Applied, Interview, Offer and Rejected.',
  },
  {
    icon: Gauge,
    title: 'AI match score',
    text: 'See how well your resume fits a job description before you apply.',
  },
  {
    icon: Target,
    title: 'Missing skills',
    text: 'Know exactly which skills the job asks for that your resume does not show.',
  },
  {
    icon: PenLine,
    title: 'Cover letters',
    text: 'Generate a tailored draft from your own resume facts, then edit and copy it.',
  },
  {
    icon: FileUp,
    title: 'Upload your CV',
    text: 'Drop a PDF or DOCX and review the extracted text. No retyping.',
  },
  {
    icon: Lock,
    title: 'Your data, your control',
    text: 'Only you can see your applications, and you can delete your account any time.',
  },
];

const steps = [
  { title: 'Add your resume', text: 'Upload a PDF or DOCX, or paste the text.' },
  { title: 'Add a job', text: 'Paste the job description and track it on your board.' },
  { title: 'Analyze and apply', text: 'Get a match score, fix the gaps and write your cover letter.' },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-app">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-fg">
            <Rocket size={20} />
          </span>
          <span className="text-lg font-semibold text-fg">ApplyPilot</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!loading &&
            (user ? (
              <Link href="/dashboard" className="btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">
                  Login
                </Link>
                <Link href="/register" className="btn-primary hidden sm:inline-flex">
                  Get started
                </Link>
              </>
            ))}
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
                AI job application tracker
              </span>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-fg sm:text-5xl">
                Track every job.{' '}
                <span className="text-brand">Match your CV.</span> Write the
                cover letter.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted">
                ApplyPilot keeps your job search in one board and uses AI to
                score your resume against each job and draft cover letters from
                your real experience.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={user ? '/dashboard' : '/register'}
                  className="btn-primary px-5 py-3 text-base"
                >
                  {user ? 'Open dashboard' : 'Get started free'}
                  <ArrowRight size={18} />
                </Link>
                {!user && (
                  <Link href="/login" className="btn-ghost px-5 py-3 text-base">
                    I have an account
                  </Link>
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="card p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-fg">
                    S
                  </span>
                  <div>
                    <p className="font-semibold text-fg">Sample Company</p>
                    <p className="text-sm text-muted">Full Stack Developer</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-5">
                  <ScoreRing score={82} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg">Missing skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['Docker', 'PostgreSQL', 'Testing'].map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-700 dark:text-rose-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-muted">
                Example preview
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-fg sm:text-3xl">
            Everything you need for your job search
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon size={20} />
                </span>
                <h3 className="mt-3 font-semibold text-fg">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-fg sm:text-3xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="card p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-fg">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold text-fg">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {!user && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="card flex flex-col items-center gap-4 bg-brand/5 p-10 text-center">
              <h2 className="text-2xl font-bold text-fg">
                Ready to organize your job search?
              </h2>
              <p className="max-w-md text-sm text-muted">
                Create a free account and add your first application in under a
                minute.
              </p>
              <Link href="/register" className="btn-primary px-5 py-3 text-base">
                Create your account
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-line py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-sm text-muted sm:px-6">
          <span>Built by Adeel Raza</span>
          <a
            href="https://github.com/Adeel-Raza001/applypilot"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg"
          >
            View source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}