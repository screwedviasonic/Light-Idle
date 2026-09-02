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
