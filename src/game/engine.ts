import type {
  Activity,
  ActiveAction,
  Bounty,
  CombatState,
  EnemyState,
  EquipSlot,
  GameState,
  GuardianClass,
  Item,
  LogEntry,
  OfflineReport,
  Rarity,
  WeaponSlot,
  WeaponType,
} from '../types';
import {
  ACTIVITIES,
  ACTIVITY_MAP,
  ALL_SKILL_IDS,
  BOUNTY_POOL,
  CALIBRATION_MAX,
  DEST_MAT_IDS,
  INVENTORY_CAP,
  MATERIAL_LABEL,
  OFFLINE_CAP_HOURS_DEFAULT,
  PATTERN_DEFS,
  PATTERN_MAP,
  PACKAGE_READY_CAP,
  POSTMASTER_CAP,
  SAVE_VERSION,
  VAULT_CAP,
  SKILL_META,
  TEMPLATE_MAP,
  TEMPLATES,
  WEAPON_TYPES,
  XP_PER_LEVEL,
  calibrationCost,
  startingLoadout,
} from './content';
import type { ArmorSlot, PatternState } from '../types';
import { readAwayWatermark } from './session';

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36).slice(-4)}`;
}

export function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

export function rand(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

export function irand(a: number, b: number): number {
  return Math.floor(rand(a, b + 1));
}

export function pickWeighted<T extends { weight: number }>(list: T[]): T | null {
  const total = list.reduce((s, x) => s + x.weight, 0);
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const x of list) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return list[list.length - 1] ?? null;
}

export function levelFromXp(xp: number): number {
  return Math.min(100, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function emptySkills(): Record<string, { xp: number }> {
  const s: Record<string, { xp: number }> = {};
  for (const id of ALL_SKILL_IDS) s[id] = { xp: 0 };
  return s;
}

export function emptyPatterns(): Record<string, PatternState> {
  const s: Record<string, PatternState> = {};
  for (const p of PATTERN_DEFS) s[p.templateId] = { xp: 0, finished: false };
  return s;
}

export function emptyMaterials(): Record<string, number> {
  const s: Record<string, number> = {};
  for (const id of DEST_MAT_IDS) s[id] = 0;
  return s;
}

export function emptyCalibrations(): Record<string, number> {
  const s: Record<string, number> = {};
  for (const id of DEST_MAT_IDS) s[id] = 0;
  return s;
}

export function ensureLoopFields(state: GameState): void {
  if (!state.patterns) state.patterns = emptyPatterns();
  for (const p of PATTERN_DEFS) {
    if (!state.patterns[p.templateId]) state.patterns[p.templateId] = { xp: 0, finished: false };
  }
  if (!state.materials) state.materials = emptyMaterials();
  for (const id of DEST_MAT_IDS) {
    if (typeof state.materials[id] !== 'number') state.materials[id] = 0;
  }
  if (typeof state.gunsmithParts !== 'number') state.gunsmithParts = 0;
  if (!state.calibrations) state.calibrations = emptyCalibrations();
  for (const id of DEST_MAT_IDS) {
    if (typeof state.calibrations[id] !== 'number') state.calibrations[id] = 0;
    state.calibrations[id] = clamp(state.calibrations[id], 0, CALIBRATION_MAX);
  }
  if (!state.settings) state.settings = { muted: true, offlineCapHours: OFFLINE_CAP_HOURS_DEFAULT };
  if (typeof state.settings.offlineCapHours !== 'number') {
    state.settings.offlineCapHours = OFFLINE_CAP_HOURS_DEFAULT;
  }
  if (typeof state.lastTickAt !== 'number' || state.lastTickAt <= 0) {
    const away = readAwayWatermark();
    if (away > 0) state.lastTickAt = away;
    else state.lastTickAt = state.lastSavedAt && state.lastSavedAt > 0 ? state.lastSavedAt : Date.now();
  }
  if (state.vendors) {
    for (const v of Object.values(state.vendors)) {
      if (!v) continue;
      if (typeof v.packagesReady !== 'number' || v.packagesReady < 0) v.packagesReady = 0;
      v.packagesReady = Math.min(PACKAGE_READY_CAP, v.packagesReady);
    }
  }
}

function patternUnfinished(state: GameState, templateId: string): boolean {
  if (!PATTERN_MAP[templateId]) return false;
  return !state.patterns[templateId]?.finished;
}

function destHasUnfinished(state: GameState, act: Activity): boolean {
  if (act.destination) {
    return PATTERN_DEFS.some(
      (p) => p.destination === act.destination && patternUnfinished(state, p.templateId),
    );
  }
  return (act.patternIds ?? []).some((id) => patternUnfinished(state, id));
}

/** Live chase list for a node. Never includes FINISHED guns. */
export function activityFeedPatterns(state: GameState, act: Activity): string[] {
  ensureLoopFields(state);
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (id: string) => {
    if (!id || seen.has(id) || !patternUnfinished(state, id)) return;
    seen.add(id);
    out.push(id);
  };

  if (act.destination) {
    for (const id of act.patternIds ?? []) {
      if (PATTERN_MAP[id]?.destination === act.destination) push(id);
    }
    for (const def of PATTERN_DEFS) {
      if (def.destination === act.destination) push(def.templateId);
    }
  } else {
    for (const id of act.patternIds ?? []) push(id);
  }

  if (out.length > 0) return out;

  for (const def of PATTERN_DEFS) {
    if (patternUnfinished(state, def.templateId)) {
      out.push(def.templateId);
      break;
    }
  }
  return out;
}

/** Dest (or node patternIds) are fully mapped; feed is the account chase at half XP. */
export function activityFeedOverflow(state: GameState, act: Activity): boolean {
  ensureLoopFields(state);
  if (destHasUnfinished(state, act)) return false;
  return activityFeedPatterns(state, act).length > 0;
}

export function patternXpPerCycle(state: GameState, act: Activity): number {
  const cls = state.guardian?.class ?? 'hunter';
  const xpM = classXpMult(cls) * (hasPerk(state, 'lightwell') ? 1.1 : 1);
  const fam = Math.max(1, Math.round((act.patternXp ?? Math.round(act.destXp * 0.45)) * xpM));
  if (activityFeedOverflow(state, act)) return Math.max(1, Math.round(fam / 2));
  return fam;
}

/** Remaining cycles × activity duration. 0 if ready or finished. */
export function patternEtaMs(state: GameState, act: Activity, templateId: string): number {
  const def = PATTERN_MAP[templateId];
  if (!def) return 0;
  const p = state.patterns[templateId];
  if (!p || p.finished || p.xp >= def.xpToReady) return 0;
  const remaining = def.xpToReady - (p.xp ?? 0);
  const fam = Math.max(1, patternXpPerCycle(state, act));
  const cycles = Math.ceil(remaining / fam);
  return cycles * activityDuration(state, act);
}
