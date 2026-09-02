import type { GuardianClass } from '../types';

export function ClassMark({ cls, size = 36 }: { cls: GuardianClass; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="class-mark">
      {cls === 'hunter' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M24 6 L40 20 L32 20 L32 42 L16 42 L16 20 L8 20 Z" />
          <path d="M20 28 L24 22 L28 28" />
        </g>
      )}
      {cls === 'titan' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 14 L24 8 L40 14 L40 28 C40 36 32 42 24 44 C16 42 8 36 8 28 Z" />
          <rect x="20" y="18" width="8" height="14" />
        </g>
      )}
      {cls === 'warlock' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="24" cy="24" r="16" />
          <polygon points="24,12 34,24 24,36 14,24" />
          <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  );
}

export function GhostMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <polygon points="16,3 29,16 16,29 3,16" fill="none" stroke="#d4af6a" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="4" fill="none" stroke="#eceae4" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="1.5" fill="#d4af6a" />
    </svg>
  );
}
