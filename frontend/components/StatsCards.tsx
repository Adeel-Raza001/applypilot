import {
  Briefcase,
  Gauge,
  Send,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Application, ApplicationStatus } from '@/lib/types';

type Stat = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: string;
};

export default function StatsCards({
  applications,
}: {
  applications: Application[];
}) {
  const count = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status).length;

  const scores = applications
    .map((a) => a.matchScore)
    .filter((s): s is number => s !== null);
  const average = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : null;

  const stats: Stat[] = [
    {
      label: 'Total',
      value: applications.length,
      icon: Briefcase,
      tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Applied',
      value: count('APPLIED'),
      icon: Send,
      tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      label: 'Interviews',
      value: count('INTERVIEW'),
      icon: Users,
      tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Offers',
      value: count('OFFER'),
      icon: Trophy,
      tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Avg match',
      value: average === null ? '-' : `${average}%`,
      icon: Gauge,
      tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <div key={label} className="card flex items-center gap-3 p-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}
          >
            <Icon size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-2xl font-semibold leading-none text-fg">
              {value}
            </p>
            <p className="mt-1 truncate text-xs text-muted">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}