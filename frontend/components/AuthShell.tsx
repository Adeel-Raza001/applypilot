import { Rocket } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app p-4">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-fg">
            <Rocket size={22} />
          </span>
          <span className="text-xl font-semibold text-fg">ApplyPilot</span>
        </Link>

        <div className="card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-fg">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-5">{children}</div>
        </div>

        <div className="mt-4 text-center text-sm text-muted">{footer}</div>
      </div>
    </main>
  );
}