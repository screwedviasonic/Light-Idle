import {
  ACTIVITY_MAP,
  DEST_META,
  ELEMENT_LABEL,
  PATTERN_DEFS,
  RARITY_LABEL,
  SLOT_LABEL,
  TEMPLATE_MAP,
} from '../game/content';
import { patternPct, weaponTypeLabel } from '../game/engine';
import type { Activity, EquipSlot, GameState, Item } from '../types';

export const ELEMENT_COLOR: Record<string, string> = {
  kinetic: '#c9c6c0',
  arc: '#7ec8ff',
  solar: '#e08a3a',
  void: '#9a6cff',
  stasis: '#6ec4ff',
  strand: '#7dce6a',
};

export function destActivities(destId: string): Activity[] {
  return Object.values(ACTIVITY_MAP).filter(
    (a) => a.destination === destId && (a.kind === 'patrol' || a.kind === 'lostSector'),
  );
}

export function bestLootLabel(act: Activity): string {
  const names = (act.patternIds ?? [])
    .map((id) => TEMPLATE_MAP[id]?.name)
    .filter((n): n is string => Boolean(n));
  if (names.length) return names.join(' · ');
  if (act.engramChances.exotic > 0) return 'Exotic engram (garnish)';
  if (act.engramChances.legendary > 0) return 'Legendary engram (garnish)';
  if (act.kind === 'decrypt') return 'Familiarity + materials';
  return 'Destination rank';
}

export function activityNameplate(act: Activity): { title: string; sub: string } {
  if (act.kind === 'decrypt') return { title: 'THE TOWER', sub: 'CRYPTARCH' };
  if (act.kind === 'crucible') return { title: 'THE CRUCIBLE', sub: 'CONTROL' };
  if (act.kind === 'gambit') return { title: 'GAMBIT', sub: 'THE TABLE' };
  if (act.kind === 'raid') return { title: 'VAULT OF STARS', sub: 'RAID' };
  if (act.kind === 'nightfall') return { title: 'NIGHTFALL', sub: 'THE ORDEAL' };
  if (act.kind === 'strike') return { title: 'VANGUARD OPS', sub: 'STRIKE PLAYLIST' };
  const dest = DEST_META[act.destination ?? ''];
  const title = dest?.banner ?? 'UNKNOWN';
  const kind = act.kind === 'lostSector' ? 'LOST SECTOR' : 'PATROL';
  const sub = dest?.region ? dest.region + ' // ' + kind : kind;
  return { title, sub };
}

export function stageLabel(act: Activity): string {
  if (act.kind === 'decrypt') return 'The Tower';
  if (act.kind === 'crucible') return 'The Crucible';
  if (act.kind === 'gambit') return 'Gambit';
  if (act.kind === 'raid') return 'Vault of Stars';
  if (act.kind === 'nightfall') return 'Nightfall';
  if (act.kind === 'strike') return 'Vanguard Ops';
  const dest = DEST_META[act.destination ?? ''];
  return dest?.label ?? act.name;
}

export function stageKey(act: Activity): string {
  if (act.destination) return act.destination;
  if (act.kind === 'decrypt') return 'tower';
  return act.kind;
}

export function typeLine(item: Item): string {
  const rarity = RARITY_LABEL[item.rarity];
  if (item.kind === 'weapon') {
    const el = item.element ? ELEMENT_LABEL[item.element] : 'Kinetic';
    return `${rarity} ${el} ${weaponTypeLabel(item.weaponType)}`;
  }
  return `${rarity} ${SLOT_LABEL[item.slot]}`;
}

export function kindLabel(kind: string): string {
  if (kind === 'lostSector') return 'Lost Sector';
  if (kind === 'patrol') return 'Patrol';
  if (kind === 'strike') return 'Strike';
  if (kind === 'nightfall') return 'Nightfall';
  if (kind === 'crucible') return 'Crucible';
  if (kind === 'gambit') return 'Gambit';
  if (kind === 'raid') return 'Raid';
  if (kind === 'decrypt') return 'Decrypt';
  return kind;
}

/** Starter piece in a slot: point at the unfinished named chase, not piece Power. */
export function slotChaseCopy(game: GameState, slot: EquipSlot, item: Item | undefined): string | null {
  if (!item) return null;
  if (item.rarity !== 'common' && item.rarity !== 'uncommon') return null;
  let best: { name: string; dest: string; pct: number; idx: number } | null = null;
  for (let idx = 0; idx < PATTERN_DEFS.length; idx++) {
    const p = PATTERN_DEFS[idx];
    const gun = TEMPLATE_MAP[p.templateId];
    if (!gun || gun.slot !== slot) continue;
    if (game.patterns[p.templateId]?.finished) continue;
    const pct = patternPct(game, p.templateId);
    const dest = DEST_META[p.destination]?.label ?? p.destination;
    if (!best || pct > best.pct || (pct === best.pct && idx < best.idx)) {
      best = { name: gun.name, dest, pct, idx };
    }
  }
  return best ? `${best.name} · ${best.dest}` : null;
}
