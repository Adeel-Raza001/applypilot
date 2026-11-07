import { apiFetch } from './api';

export type ProfileUser = { id: number; email: string; name: string };

export function updateProfile(name: string) {
  return apiFetch<ProfileUser>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ success: boolean }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function deleteAccount(password: string) {
  return apiFetch<{ deleted: boolean }>('/auth/account', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}