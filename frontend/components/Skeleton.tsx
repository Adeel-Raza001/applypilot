import { Rocket } from 'lucide-react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-line/70 ${className}`} />;
}

export function PageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-brand text-brand-fg">
          <Rocket size={24} />
        </div>
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </main>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="mt-6 h-10 w-full max-w-md" />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-line/30 p-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ))}
      </div>
    </div>
  );
}