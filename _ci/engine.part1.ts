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

export function patternIsReady(state: GameState, templateId: string): boolean {
  const def = PATTERN_MAP[templateId];
  if (!def) return false;
  const p = state.patterns?.[templateId];
  if (!p || p.finished) return false;
  const xp = typeof p.xp === 'number' ? p.xp : Number(p.xp) || 0;
  return xp >= def.xpToReady;
}

export function readyPatternIds(state: GameState): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const push = (id: string) => {
    if (seen.has(id) || !patternIsReady(state, id)) return;
    seen.add(id);
    ids.push(id);
  };
  const act = state.activeAction ? ACTIVITY_MAP[state.activeAction.activityId] : undefined;
  for (const id of act?.patternIds ?? []) push(id);
  for (const def of PATTERN_DEFS) push(def.templateId);
  return ids;
}

export function patternPct(state: GameState, templateId: string): number {
  const def = PATTERN_MAP[templateId];
  const p = state.patterns[templateId];
  if (!def) return 0;
  if (p?.finished) return 100;
  return clamp(((p?.xp ?? 0) / Math.max(1, def.xpToReady)) * 100, 0, 100);
}

export function firstReadyPattern(state: GameState): { templateId: string; name: string } | null {
  const id = readyPatternIds(state)[0];
  if (!id) return null;
  const gun = TEMPLATE_MAP[id];
  return { templateId: id, name: gun?.name ?? id };
}

export function patternFinishLock(state: GameState, templateId: string): string[] {
  const def = PATTERN_MAP[templateId];
  if (!def) return [];
  const need: string[] = [];
  const haveMats = state.materials[def.finishCost.dest] ?? 0;
  if (haveMats < def.finishCost.mats) {
    need.push(`Need ${def.finishCost.mats} ${MATERIAL_LABEL[def.finishCost.dest]}`);
  }
  if (state.currencies.glimmer < def.finishCost.glimmer) {
    need.push(`Need ${def.finishCost.glimmer} Glimmer`);
  }
  return need;
}

export function patternCanFinish(state: GameState, templateId: string): boolean {
  return patternIsReady(state, templateId) && patternFinishLock(state, templateId).length === 0;
}

export function firstFinishablePattern(state: GameState): { templateId: string; name: string } | null {
  const id = readyPatternIds(state).find((tid) => patternCanFinish(state, tid));
  if (!id) return null;
  const gun = TEMPLATE_MAP[id];
  return { templateId: id, name: gun?.name ?? id };
}

function rollBounties(vendorId: string): Bounty[] {
  const pool = BOUNTY_POOL.filter((b) => b.vendorId === vendorId);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((b) => ({
    ...b,
    progress: 0,
    claimed: false,
  }));
}

export function instantiateTemplate(templateId: string, powerBonus: number, classId?: GuardianClass): Item | null {
  const t = TEMPLATE_MAP[templateId];
  if (!t) return null;
  let power = Math.max(1, Math.round(t.basePower + powerBonus));
  if (classId === 'titan' && t.kind === 'armor') power += 3;
  const stats =
    t.kind === 'armor'
      ? {
          mobility: 4 + irand(0, 8) + (t.perks.some((p) => p.id === 'stride') ? 4 : 0),
          resilience: 4 + irand(0, 8) + (t.perks.some((p) => p.id === 'bulwark') ? 4 : 0),
          recovery: 4 + irand(0, 8) + (t.perks.some((p) => p.id === 'mend') ? 4 : 0),
        }
      : {};
  return {
    id: uid('itm'),
    templateId: t.id,
    name: t.name,
    kind: t.kind,
    rarity: t.rarity,
    power,
    slot: t.slot,
    weaponType: t.weaponType,
    element: t.element,
    perks: t.perks,
    ...stats,
  };
}

export function createNewSave(name: string, cls: GuardianClass): GameState {
  const now = Date.now();
  const inventory: Item[] = [];
  const equipped: GameState['equipped'] = {
    kinetic: null,
    energy: null,
    power: null,
    helmet: null,
    gauntlets: null,
    chest: null,
    legs: null,
    classItem: null,
  };
  for (const tid of startingLoadout(cls)) {
    const item = instantiateTemplate(tid, 2, cls);
    if (!item) continue;
    inventory.push(item);
    equipped[item.slot] = item.id;
  }
  const vendors: GameState['vendors'] = {};
  for (const v of ['zavala', 'shaxx', 'drifter', 'banshee', 'cryptarch']) {
    vendors[v] = { xp: 0, bounties: rollBounties(v), packagesReady: 0 };
  }
  return {
    version: SAVE_VERSION,
    guardian: { name, class: cls, createdAt: now },
    currencies: { glimmer: 120, legendaryShards: 0 },
    engrams: { rare: 1, legendary: 0, exotic: 0 },
    skills: emptySkills(),
    vendors,
    inventory,
    vault: [],
    postmaster: [],
    equipped,
    activeAction: null,
    log: [
      {
        id: uid('log'),
        t: now,
        text: `${name} the ${cls[0].toUpperCase()}${cls.slice(1)} arrives at the Tower.`,
        kind: 'system',
      },
      {
        id: uid('log'),
        t: now,
        text: 'A Rare Engram waits at the Cryptarch. The Cosmodrome is open.',
        kind: 'info',
      },
    ],
    settings: { muted: true, offlineCapHours: OFFLINE_CAP_HOURS_DEFAULT },
    lastSavedAt: now,
    lastTickAt: now,
    stats: {
      activitiesCompleted: 0,
      itemsDismantled: 0,
      enemiesDefeated: 0,
      engramsDecrypted: 0,
      legendaryDrops: 0,
      exoticDrops: 0,
    },
    cryptarchBusyUntil: 0,
    patterns: emptyPatterns(),
    materials: emptyMaterials(),
    gunsmithParts: 0,
    calibrations: emptyCalibrations(),
  };
}

export function getItem(state: GameState, id: string | null): Item | undefined {
  if (!id) return undefined;
  return (
    state.inventory.find((i) => i.id === id) ??
    state.vault.find((i) => i.id === id) ??
    (state.postmaster ?? []).find((i) => i.id === id)
  );
}

export function patternSheetId(templateId: string): string {
  return `pattern:${templateId}`;
}

export function findLiveByTemplate(state: GameState, templateId: string): Item | undefined {
  for (const id of Object.values(state.equipped)) {
    const it = getItem(state, id);
    if (it?.templateId === templateId) return it;
  }
  return (
    state.inventory.find((i) => i.templateId === templateId) ??
    state.vault.find((i) => i.templateId === templateId) ??
    (state.postmaster ?? []).find((i) => i.templateId === templateId)
  );
}

export function templateIdByGunName(name: string | null | undefined): string | undefined {
  const n = name?.trim().toLowerCase();
  if (!n) return undefined;
  for (const t of TEMPLATES) {
    if (t.kind === 'weapon' && t.name.toLowerCase() === n) return t.id;
  }
  return undefined;
}

/** Live bag item or pattern sheet. Never a missing instance id. */
export function resolveInspectId(
  state: GameState,
