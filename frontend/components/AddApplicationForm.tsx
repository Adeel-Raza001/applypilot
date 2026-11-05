'use client';

import { useState } from 'react';
import { createApplication } from '@/lib/applications';
import { Application } from '@/lib/types';

type Props = {
  onCreated: (application: Application) => void;
  onClose: () => void;
};

export default function AddApplicationForm({ onCreated, onClose }: Props) {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const created = await createApplication({
        company: company.trim(),
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">New application</h2>

      {error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="rounded border border-gray-300 p-2 text-gray-900"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          maxLength={200}
        />
        <input
          className="rounded border border-gray-300 p-2 text-gray-900"
          placeholder="Job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <textarea
        className="h-40 w-full rounded border border-gray-300 p-2 text-gray-900"
        placeholder="Paste the job description here (min 10 characters)"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        required
        minLength={10}
        maxLength={20000}
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}