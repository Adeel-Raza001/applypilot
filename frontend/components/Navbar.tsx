'use client';

import { FileText, LayoutDashboard, LogOut, Rocket } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resume', label: 'Resume', icon: FileText },
];

const HIDDEN_ON = ['/', '/login', '/register'];

function initials(name: string) {
  const letters = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  return letters || '?';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menu ke bahar click karne par band karo
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user || HIDDEN_ON.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-fg">
              <Rocket size={18} />
            </span>
            <span className="font-semibold text-fg">ApplyPilot</span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                    active
                      ? 'bg-brand/10 font-medium text-brand'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Account menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-fg"
            >
              {initials(user.name)}
            </button>

            {open && (
              <div className="card absolute right-0 mt-2 w-56 p-2 shadow-lg">
                <div className="border-b border-line px-2 pb-2">
                  <p className="truncate text-sm font-medium text-fg">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                    router.push('/login');
                    toast.success('Logged out');
                  }}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-fg hover:bg-line/40"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}