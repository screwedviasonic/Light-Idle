import type { Item } from '../types';

export function ItemGlyph({ item, size = 28 }: { item: Item; size?: number }) {
  const stroke = 'currentColor';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="item-glyph">
      {item.kind === 'weapon' ? weaponShape(item.weaponType, stroke) : armorShape(item.slot, stroke)}
    </svg>
  );
}

function weaponShape(type: string | undefined, stroke: string) {
  switch (type) {
    case 'handCannon':
      return <path d="M6 20 H18 L22 10 H26 M18 20 L22 26 H10" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'scout':
      return <path d="M4 16 H28 M22 16 L26 10 M10 16 V22" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'pulse':
      return <path d="M4 18 H24 L28 12 M12 18 V24 M16 18 V22" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'auto':
      return <path d="M4 17 H26 L29 12 M8 17 V24 H14 M18 17 V22" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'shotgun':
      return <path d="M4 18 H16 L28 14 M16 18 L28 20 M8 18 V24" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'sniper':
      return <path d="M3 16 H29 M20 16 L24 8 M10 16 V22" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'fusion':
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.6">
          <polygon points="6,16 16,8 26,16 16,24" />
          <circle cx="16" cy="16" r="3" />
        </g>
      );
    case 'rocket':
      return <path d="M6 20 L16 8 L20 12 L10 24 Z M16 8 L26 6" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'sword':
      return <path d="M16 4 L18 18 L16 28 L14 18 Z M10 20 H22" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'bow':
      return <path d="M8 6 Q24 16 8 26 M8 6 L8 26 M12 16 H22" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'smg':
      return <path d="M5 18 H22 L26 12 M9 18 V24 H15" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'grenadeLauncher':
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.6">
          <rect x="6" y="12" width="18" height="10" rx="2" />
          <circle cx="22" cy="10" r="3" />
        </g>
      );
    case 'lmg':
      return <path d="M3 17 H26 L30 12 M6 17 V24 H16 M18 17 V22" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'sidearm':
      return <path d="M8 18 H18 L20 12 M18 18 L20 24 H12" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'trace':
      return <path d="M6 16 H26 M16 8 V24" fill="none" stroke={stroke} strokeWidth="1.6" />;
    default:
      return <rect x="8" y="8" width="16" height="16" fill="none" stroke={stroke} />;
  }
}

function armorShape(slot: string, stroke: string) {
  switch (slot) {
    case 'helmet':
      return <path d="M8 18 Q8 8 16 8 Q24 8 24 18 V24 H8 Z" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'gauntlets':
      return <path d="M10 8 H22 V14 L18 24 H14 L10 14 Z" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'chest':
      return <path d="M10 10 L16 8 L22 10 L24 24 H8 Z" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'legs':
      return <path d="M10 8 H22 L20 28 H18 L16 16 L14 28 H12 Z" fill="none" stroke={stroke} strokeWidth="1.6" />;
    case 'classItem':
      return <polygon points="16,6 26,16 16,26 6,16" fill="none" stroke={stroke} strokeWidth="1.6" />;
    default:
      return <rect x="8" y="8" width="16" height="16" fill="none" stroke={stroke} />;
  }
}

export function EmptySocket({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="empty-socket">
      <polygon points="16,4 28,16 16,28 4,16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
    </svg>
  );
}
