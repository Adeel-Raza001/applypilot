'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createApplication({
        company: company.trim(),
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
      });
      onCreated(created);
      toast.success(`Added ${created.company}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-6 space-y-3 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fg">New application</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close form"
          className="text-muted hover:text-fg"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="field"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          maxLength={200}
        />
        <input
          className="field"
          placeholder="Job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <textarea
        className="field h-40"
        placeholder="Paste the job description here (min 10 characters)"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        required
        minLength={10}
        maxLength={20000}
      />

      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}