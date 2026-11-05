  import { apiFetch } from './api';

  export function analyzeApplication(id: number) {
    return apiFetch<{
      matchScore: number;
      missingSkills: string[];
      summary: string;
    }>(`/ai/analyze/${id}`, { method: 'POST' });
  }

  export function generateCoverLetter(id: number) {
    return apiFetch<{ coverLetter: string }>(`/ai/cover-letter/${id}`, {
      method: 'POST',
    });
  }