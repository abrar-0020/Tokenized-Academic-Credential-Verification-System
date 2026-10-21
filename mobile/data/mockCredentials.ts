export interface CredentialData {
  d: string;           // degree
  p: string;           // program / major
  u: string;           // institution
  m: string;           // monogram
  y: string;           // issue year
  s: string;           // study span
  id: string;          // credential ID
  studentName: string;
  grade: string;
  tokenId: string;
  explorerUrl: string;
  status: string;
}

export const CREDENTIALS: CredentialData[] = [
  {
    d: 'Bachelor of Technology',
    p: 'Computer Science & Engineering',
    u: 'Presidency University',
    m: 'PU',
    y: '2026',
    s: '2023 — 2027',
    id: 'TC-2026-48X7QA',
    studentName: 'Abrar',
    grade: '8.7 CGPA',
    tokenId: 'TC-TOKEN-829341',
    explorerUrl: 'https://example.com/explorer/token/TC-TOKEN-829341',
    status: 'Verified',
  },
  {
    d: 'Minor in Artificial Intelligence',
    p: 'Applied Machine Learning',
    u: 'Presidency University',
    m: 'PU',
    y: '2026',
    s: '2024 — 2026',
    id: 'TC-2026-9KD2LM',
    studentName: 'Abrar',
    grade: 'A Grade (9.1 GPA)',
    tokenId: 'TC-TOKEN-514072',
    explorerUrl: 'https://example.com/explorer/token/TC-TOKEN-514072',
    status: 'Verified',
  },
  {
    d: 'Senior Secondary Certificate',
    p: 'Science Stream',
    u: 'Bengaluru Central School',
    m: 'BC',
    y: '2023',
    s: '2021 — 2023',
    id: 'TC-2023-5TR8WB',
    studentName: 'Abrar',
    grade: '91.4%',
    tokenId: 'TC-TOKEN-367815',
    explorerUrl: 'https://example.com/explorer/token/TC-TOKEN-367815',
    status: 'Verified',
  },
];
