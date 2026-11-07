'use client';

import { AlertTriangle, FileText, KeyRound, Save, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PasswordInput from '@/components/PasswordInput';
import { PageLoader } from '@/components/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { changePassword, deleteAccount, updateProfile } from '@/lib/profile';

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('') || '?'
  );
}

export default function ProfilePage() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  function handleError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      router.replace('/login');
      toast.error('Session expired. Please login again.');
      return;
    }
    toast.error(err instanceof Error ? err.message : 'Something went wrong');
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      const updated = await updateProfile(name.trim());
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      handleError(err);
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed');
    } catch (err) {
      handleError(err);
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      logout();
      router.replace('/register');
      toast.success('Your account was deleted');
    } catch (err) {
      handleError(err);
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !user) return <PageLoader />;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="card flex items-center gap-4 p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-brand-fg">
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-fg">{user.name}</h1>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>

      <Link
        href="/resume"
        className="card mt-4 flex items-center justify-between p-4 transition hover:border-brand/60"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <FileText size={20} />
          </span>
          <span>
            <span className="block font-medium text-fg">My resume</span>
            <span className="block text-xs text-muted">
              Upload or edit the CV the AI uses
            </span>
          </span>
        </span>
        <span className="text-sm text-brand">Open</span>
      </Link>

      <form onSubmit={handleNameSubmit} className="card mt-4 space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-fg">
          <UserRound size={18} />
          Profile details
        </h2>
        <div>
          <label className="mb-1 block text-xs text-muted">Name</label>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Email</label>
          <input className="field opacity-60" value={user.email} disabled />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingName || name.trim() === user.name}
            className="btn-primary"
          >
            <Save size={16} />
            {savingName ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card mt-4 space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-fg">
          <KeyRound size={18} />
          Change password
        </h2>
        <PasswordInput
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="New password (min 8 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          maxLength={72}
        />
        <PasswordInput
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          maxLength={72}
        />
        <div className="flex justify-end">
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>

      <section className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/5 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
          <AlertTriangle size={18} />
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-muted">
          Deleting your account permanently removes your resume and all your
          applications. This cannot be undone.
        </p>

        {!showDelete ? (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="mt-4 rounded-lg border border-rose-500/50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400"
          >
            Delete my account
          </button>
        ) : (
          <form onSubmit={handleDelete} className="mt-4 space-y-3">
            <PasswordInput
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={deleting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDelete(false);
                  setDeletePassword('');
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}