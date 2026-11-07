import { apiFetch } from './api';

export function getResume() {
  return apiFetch<{ content: string }>('/resume');
}

export function saveResume(content: string) {
  return apiFetch<{ content: string; updatedAt: string }>('/resume', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export function extractResumeText(file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<{ content: string; truncated: boolean }>('/resume/extract', {
    method: 'POST',
    body: form,
  });
}