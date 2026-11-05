export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

export const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
];

export type Application = {
  id: number;
  company: string;
  jobTitle: string;
  jobDescription: string;
  status: ApplicationStatus;
  matchScore: number | null;
  missingSkills: string[];
  coverLetter: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};