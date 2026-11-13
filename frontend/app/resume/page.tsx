'use client';

import { FileText, Loader2, Save, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PageLoader, Skeleton } from '@/components/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { extractResumeText, getResume, saveResume } from '@/lib/resume';

const MAX_BYTES = 4 * 1024 * 1024;

export default function ResumePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [unsaved, setUnsaved] = useState(false);

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
    getResume()
      .then((r) => setContent(r.content))
      .catch(handleError)
      .finally(() => setFetching(false));
  }, [user, handleError]);

  async function processFile(file: File) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx')) {
      toast.error('Please choose a PDF or DOCX file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('File is too large. Maximum size is 4 MB.');
      return;
    }

    setExtracting(true);
    try {
      const result = await extractResumeText(file);
      setContent(result.content);
      setFileName(file.name);
      setUnsaved(true);
      if (result.truncated) {
        toast.warning('Your resume was long, so it was shortened to 20000 characters.');
      }
      toast.success('Text extracted. Review it, then click Save.');
    } catch (err) {
      handleError(err);
    } finally {
      setExtracting(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveResume(content.trim());
      setUnsaved(false);
      toast.success('Resume saved');
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return <PageLoader />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-fg">My resume</h1>
      <p className="mt-1 text-sm text-muted">
        Upload your CV or paste it as text. The AI uses it to score jobs and
        write cover letters.
      </p>

      {fetching ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-80" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !extracting && inputRef.current?.click()}
            className={`card flex cursor-pointer flex-col items-center gap-2 border-dashed p-8 text-center transition ${
              dragging ? 'border-brand bg-brand/4' : 'hover:border-brand/60'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />

            {extracting ? (
              <>
                <Loader2 size={28} className="animate-spin text-brand" />
                <p className="font-medium text-fg">Reading your file...</p>
              </>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <UploadCloud size={24} />
                </span>
                <p className="font-medium text-fg">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted">PDF or DOCX, up to 4 MB</p>
              </>
            )}

            {fileName && !extracting && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <FileText size={14} />
                {fileName}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-amber-400/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            Your text is sent to an AI provider when you analyze or write a
            cover letter. Remove your phone number and home address from the
            text below before saving.
          </div>

          <textarea
            className="field h-96"
            placeholder="Your resume text appears here after upload, or paste it yourself (minimum 20 characters)"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setUnsaved(true);
            }}
            required
            minLength={20}
            maxLength={20000}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">
              {content.length} / 20000
              {unsaved && ' - unsaved changes'}
            </span>
            <button
              type="submit"
              disabled={saving || extracting}
              className="btn-primary"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save resume'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}