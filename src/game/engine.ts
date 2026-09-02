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
