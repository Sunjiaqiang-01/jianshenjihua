export const Icon = {
  knee: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M8 3v4.5c0 1.6.6 3 1.8 4.1L13 15" />
      <path d="M13 15c1.4 1.3 2.2 3 2.2 5v1" />
      <circle cx="13" cy="15" r="1.6" />
      <path d="M16 3v4.5" />
    </svg>
  ),
  hair: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 11c0-4 3.6-7 8-7s8 3 8 7" />
      <path d="M4 11v2M8 8v3M12 7v4M16 8v3M20 11v2" />
      <path d="M12 21c-2.5 0-4-1.5-4-3.5V14" />
      <path d="M12 21c2.5 0 4-1.5 4-3.5V14" />
    </svg>
  ),
  sleep: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8.4 8.4 0 1 0 10.5 10.5z" />
      <path d="M17 4h3l-3 3h3" strokeWidth="1.3" />
    </svg>
  ),
  play: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10-6.8a1 1 0 0 0 0-1.8l-10-6.8A1 1 0 0 0 8 5.2z" /></svg>
  ),
  pause: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><rect x="6.5" y="4.5" width="3.6" height="15" rx="1.2" /><rect x="13.9" y="4.5" width="3.6" height="15" rx="1.2" /></svg>
  ),
  reset: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11a9 9 0 1 1 2.6 7" /><path d="M3 5v6h6" />
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  ),
}