import { apiFetch } from './api';
import { Application, ApplicationStatus } from './types';

export function listApplications() {
  return apiFetch<Application[]>('/applications');
}

export function createApplication(input: {
  company: string;
  jobTitle: string;
  jobDescription: string;
}) {
  return apiFetch<Application>('/applications', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateApplicationStatus(id: number, status: ApplicationStatus) {
  return apiFetch<Application>(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteApplication(id: number) {
  return apiFetch<{ deleted: boolean }>(`/applications/${id}`, {
    method: 'DELETE',
  });
}