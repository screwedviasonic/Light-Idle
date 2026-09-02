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
  itemId: string | null | undefined,
  name?: string | null,
): string | null {
  if (itemId?.startsWith('pattern:')) {
    const tid = itemId.slice('pattern:'.length);
    if (PATTERN_MAP[tid] && TEMPLATE_MAP[tid]) return itemId;
  }
  if (itemId) {
    const live = getItem(state, itemId);
    if (live) return live.id;
    if (PATTERN_MAP[itemId] && TEMPLATE_MAP[itemId]) return patternSheetId(itemId);
  }
  const tid = templateIdByGunName(name);
  if (tid) {
    const live = findLiveByTemplate(state, tid);
    if (live) return live.id;
    if (PATTERN_MAP[tid]) return patternSheetId(tid);
  }
  return null;
}

/** Foundry gun, then ready sheet, then pattern:* loot. Never random bag loot. */
export function pickDecryptCeremonyLog(entries: LogEntry[]): LogEntry | null {
  for (const e of entries) {
    if (e.text.includes('finished at the Foundry')) return e;
  }
  for (const e of entries) {
    if (e.text.includes('ready — Finish at Banshee') || e.text.includes('ready at Banshee')) return e;
  }
  for (const e of entries) {
    if (e.kind === 'loot' && e.itemId?.startsWith('pattern:')) return e;
  }
  return null;
}

export function ensureBags(state: GameState): void {
  if (!Array.isArray(state.postmaster)) state.postmaster = [];
}

/** Inventory → vault → postmaster. Never lets displayed bags exceed their caps. */
export function stashItem(state: GameState, item: Item): 'inventory' | 'vault' | 'postmaster' | 'lost' {
  ensureBags(state);
  if (state.inventory.length < INVENTORY_CAP) {
    state.inventory.push(item);
    return 'inventory';
  }
  if (state.vault.length < VAULT_CAP) {
    state.vault.push(item);
    return 'vault';
  }
  if (state.postmaster.length < POSTMASTER_CAP) {
    state.postmaster.push(item);
    return 'postmaster';
  }
  return 'lost';
}

const RARITY_RANK: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  legendary: 3,
  exotic: 4,
};

export function isEquipped(state: GameState, id: string): boolean {
  return Object.values(state.equipped).includes(id);
}

function bagsHaveSpace(state: GameState): boolean {
  ensureBags(state);
  return (
    state.inventory.length < INVENTORY_CAP ||
    state.vault.length < VAULT_CAP ||
    state.postmaster.length < POSTMASTER_CAP
  );
}

function lowestRarityUnequippedId(state: GameState, keepId?: string): string | null {
  ensureBags(state);
  const all = [...state.inventory, ...state.vault, ...state.postmaster];
  let best: Item | null = null;
  for (const item of all) {
    if (keepId && item.id === keepId) continue;
    if (isEquipped(state, item.id)) continue;
    if (
      !best ||
      RARITY_RANK[item.rarity] < RARITY_RANK[best.rarity] ||
      (item.rarity === best.rarity && item.power < best.power)
    ) {
      best = item;
    }
  }
  return best?.id ?? null;
}

/** Free a bag slot, then an inventory slot, so a foundry gun can be given and equipped. */
export function makeSpaceForItem(state: GameState, slot: EquipSlot, keepId?: string): void {
  ensureBags(state);
  if (state.inventory.length >= INVENTORY_CAP) {
    const prevId = state.equipped[slot];
    if (prevId && prevId !== keepId && state.inventory.some((i) => i.id === prevId)) {
      state.equipped[slot] = null;
      vaultItem(state, prevId);
    }
  }
  while (state.inventory.length >= INVENTORY_CAP) {
    const movable = state.inventory.find((i) => !isEquipped(state, i.id) && i.id !== keepId);
    if (!movable) break;
    const before = state.inventory.length;
    vaultItem(state, movable.id);
    if (state.inventory.length >= before) break;
  }
  while (!bagsHaveSpace(state) || state.inventory.length >= INVENTORY_CAP) {
    const id = lowestRarityUnequippedId(state, keepId);
    if (!id) break;
    const before =
      state.inventory.length + state.vault.length + state.postmaster.length;
    dismantleItem(state, id);
    const after =
      state.inventory.length + state.vault.length + state.postmaster.length;
    if (after >= before) break;
    if (state.inventory.length < INVENTORY_CAP && bagsHaveSpace(state)) break;
  }
}

export function dismantleJunk(state: GameState): number {
  ensureBags(state);
  const ids: string[] = [];
  for (const bag of [state.inventory, state.vault, state.postmaster]) {
    for (const item of bag) {
      if (isEquipped(state, item.id)) continue;
      if (item.rarity === 'common' || item.rarity === 'uncommon') ids.push(item.id);
    }
  }
  for (const id of ids) dismantleItem(state, id);
  if (ids.length) {
    pushLog(state, {
      kind: 'info',
      text: `Dismantled ${ids.length} junk piece${ids.length === 1 ? '' : 's'} (common / uncommon).`,
    });
  }
  return ids.length;
}

export function enforceCaps(state: GameState): void {
  ensureBags(state);
  const vaultBefore = state.vault.length;
  const invBefore = state.inventory.length;
  if (state.inventory.length > INVENTORY_CAP) {
    const extra = state.inventory.splice(INVENTORY_CAP);
    for (const item of extra) stashItem(state, item);
  }
  if (state.vault.length > VAULT_CAP) {
    const extra = state.vault.splice(VAULT_CAP);
    for (const item of extra) {
      if (state.postmaster.length < POSTMASTER_CAP) state.postmaster.push(item);
    }
  }
  if (state.postmaster.length > POSTMASTER_CAP) {
    state.postmaster.length = POSTMASTER_CAP;
  }
  const overflowed = invBefore > INVENTORY_CAP || vaultBefore > VAULT_CAP;
  if (overflowed && state.guardian) {
    pushLog(state, {
      kind: 'system',
      text: 'Bags were over capacity. Extra gear is with the Postmaster.',
    });
  }
}

export function equippedItems(state: GameState): Item[] {
  return (Object.values(state.equipped) as (string | null)[])
    .map((id) => getItem(state, id))
    .filter((x): x is Item => Boolean(x));
}

export function guardianPower(state: GameState): number {
  const slots: EquipSlot[] = [
    'kinetic',
    'energy',
    'power',
    'helmet',
    'gauntlets',
    'chest',
    'legs',
    'classItem',
  ];
  let sum = 0;
  for (const s of slots) {
    const it = getItem(state, state.equipped[s]);
    sum += it?.power ?? 0;
  }
  return Math.floor(sum / slots.length);
}

export function armorStats(state: GameState): { mobility: number; resilience: number; recovery: number } {
  const items = equippedItems(state);
  return items.reduce(
    (acc, it) => ({
      mobility: acc.mobility + (it.mobility ?? 0),
      resilience: acc.resilience + (it.resilience ?? 0),
      recovery: acc.recovery + (it.recovery ?? 0),
    }),
    { mobility: 0, resilience: 0, recovery: 0 },
  );
}

export function hasPerk(state: GameState, id: string): boolean {
  return equippedItems(state).some((i) => i.perks.some((p) => p.id === id));
}

export function destLevel(state: GameState, dest?: string): number {
  if (!dest) return 1;
  return levelFromXp(state.skills[`dest_${dest}`]?.xp ?? 0);
}

const DEST_ORDER = ['cosmodrome', 'edz', 'nessus', 'moon', 'europa'];

function destRankLock(state: GameState, act: Activity): string | null {
  if (!act.destRankReq) return null;
  const idx = DEST_ORDER.indexOf(act.destination ?? '');
  if (idx <= 0) return null;
  const prev = DEST_ORDER[idx - 1];
  if (destLevel(state, prev) < act.destRankReq) {
    const prevLabel = prev.charAt(0).toUpperCase() + prev.slice(1);
    return `${prevLabel} rank ${act.destRankReq} required`;
  }
  return null;
}

function usesPowerDoor(act: Activity): boolean {
  return act.kind === 'nightfall' || act.kind === 'raid';
}

export function activityUnlocked(state: GameState, act: Activity): boolean {
  return activityLockedReason(state, act) == null;
}

export function activityLockedReason(state: GameState, act: Activity): string | null {
  const destLock = destRankLock(state, act);
  if (destLock) return destLock;
  if (usesPowerDoor(act)) {
    const pwr = guardianPower(state);
    if (pwr + 15 < act.powerReq && act.powerReq > 0) {
      return `Requires Power ${act.powerReq}`;
    }
  }
  return null;
}

export function classDurationMult(cls: GuardianClass, act: Activity): number {
  if (cls === 'hunter' && (act.kind === 'patrol' || act.kind === 'lostSector')) return 0.82;
  return 1;
}

export function classGlimmerMult(cls: GuardianClass): number {
  return cls === 'titan' ? 1.28 : 1;
}

export function classXpMult(cls: GuardianClass): number {
  return cls === 'warlock' ? 1.22 : 1;
}

export function classEngramLuck(cls: GuardianClass): number {
  return cls === 'warlock' ? 1.35 : 1;
}

export function activityDuration(state: GameState, act: Activity): number {
  const cls = state.guardian?.class ?? 'hunter';
  let d = act.durationMs * classDurationMult(cls, act);
  const dest = act.destination ? destLevel(state, act.destination) : 1;
  d *= 1 - Math.min(0.18, (dest - 1) * 0.012);
  if (act.destination) {
    const cal = clamp(state.calibrations?.[act.destination] ?? 0, 0, CALIBRATION_MAX);
    d *= 1 - 0.06 * cal;
  }
  return Math.max(800, d);
}

export function computeDps(state: GameState, act: Activity): number {
  const pwr = guardianPower(state);
  const rec = Math.max(1, act.powerReq);
  let ratio = pwr / rec;
  if (hasPerk(state, 'steady')) ratio += 0.08;
  ratio = clamp(ratio, 0.12, 1.55);
  if (ratio < 0.4) ratio *= 0.55;

  const weapons = equippedItems(state).filter((i) => i.kind === 'weapon');
  let weapon = 6;
  for (const w of weapons) {
    const mastery = levelFromXp(state.skills[`wpn_${w.weaponType}`]?.xp ?? 0);
    weapon += w.power * 0.35 * (1 + mastery * 0.025);
    if (w.perks.some((p) => p.id === 'swift')) weapon *= 1.06;
    if (w.perks.some((p) => p.id === 'rending')) weapon *= 1.08;
    if (w.perks.some((p) => p.id === 'heavy')) weapon *= 1.05;
  }
  const { mobility, resilience, recovery } = armorStats(state);
  const armor = 1 + (mobility + resilience + recovery) / 400;
  const cls = state.guardian?.class ?? 'hunter';
  const classMod = cls === 'hunter' ? 1.08 : cls === 'titan' ? 1.12 : 1.05;
  return Math.max(2, weapon * ratio * armor * classMod);
}

function makeCombat(state: GameState, act: Activity): CombatState | null {
  if (!act.combat) return null;
  const waves: EnemyState[][] = act.combat.waves.map((e) => {
    const scaled = Math.round(e.hp * (0.85 + act.powerReq / 200));
    return [{ name: e.name, hp: scaled, maxHp: scaled }];
  });
  return {
    waves,
    waveIndex: 0,
    enemyIndex: 0,
    superMeter: 0,
    superActiveMs: 0,
    dps: computeDps(state, act),
  };
}

export function currentEnemy(combat: CombatState | null): EnemyState | null {
  if (!combat) return null;
  return combat.waves[combat.waveIndex]?.[combat.enemyIndex] ?? null;
}

export function pushLog(state: GameState, entry: Omit<LogEntry, 'id' | 't'>): void {
  state.log.unshift({ ...entry, id: uid('log'), t: Date.now() });
  if (state.log.length > 80) state.log.length = 80;
}

function addSkillXp(state: GameState, skillId: string, amount: number): void {
  if (!state.skills[skillId]) state.skills[skillId] = { xp: 0 };
  const before = levelFromXp(state.skills[skillId].xp);
  state.skills[skillId].xp += amount;
  const after = levelFromXp(state.skills[skillId].xp);
  if (after > before) {
    const meta = SKILL_META[skillId];
    pushLog(state, {
      kind: 'info',
      rarity: 'rare',
      text: `${meta?.label ?? skillId} reached rank ${after}.`,
    });
    const vendorId = skillId.startsWith('vendor_') ? skillId.replace('vendor_', '') : null;
    if (vendorId && state.vendors[vendorId]) {
      const vs = state.vendors[vendorId];
      vs.packagesReady = Math.min(PACKAGE_READY_CAP, (vs.packagesReady ?? 0) + 1);
      pushLog(state, {
        kind: 'info',
        rarity: 'legendary',
        text: `Rank-up package ready at ${vendorId[0].toUpperCase()}${vendorId.slice(1)}.`,
      });
    }
    if (skillId.startsWith('dest_')) {
      grantDestRankArmor(state, skillId.replace('dest_', ''), after);
    }
  }
}

const ARMOR_SLOTS: ArmorSlot[] = ['helmet', 'gauntlets', 'chest', 'legs', 'classItem'];

const ARMOR_BY_SLOT: Record<ArmorSlot, string[]> = {
  helmet: ['h_helm_u', 'h_helm_r', 'h_helm_l', 'h_helm_x'],
  gauntlets: ['h_gaunt_u', 'h_gaunt_r', 'h_gaunt_l'],
  chest: ['h_chest_u', 'h_chest_r', 'h_chest_l'],
  legs: ['h_legs_u', 'h_legs_r', 'h_legs_l'],
  classItem: ['h_class_u', 'h_class_r', 'h_class_l'],
};

function designedArmorId(slot: ArmorSlot, rank: number, cls?: GuardianClass): string {
  if (slot === 'classItem' && rank >= 6) {
    if (cls === 'hunter') return 'h_class_xh';
    if (cls === 'titan') return 'h_class_xt';
    return 'h_class_xw';
  }
  const ids = ARMOR_BY_SLOT[slot];
  if (rank <= 2) return ids[0];
  if (rank <= 3) return ids[Math.min(1, ids.length - 1)];
  if (rank <= 5) return ids[Math.min(2, ids.length - 1)];
  return ids[ids.length - 1];
}

function weakestArmorSlot(state: GameState): { slot: ArmorSlot; item: Item | undefined } {
  let slot: ArmorSlot = ARMOR_SLOTS[0];
  let item: Item | undefined;
  let power = Infinity;
  for (const s of ARMOR_SLOTS) {
    const it = getItem(state, state.equipped[s]);
    const p = it?.power ?? 0;
    if (p < power) {
      power = p;
      slot = s;
      item = it;
    }
  }
  return { slot, item };
}

function highestWeaponPower(state: GameState): number {
  let best = 0;
  for (const s of ['kinetic', 'energy', 'power'] as const) {
    best = Math.max(best, getItem(state, state.equipped[s])?.power ?? 0);
  }
  return best;
}

/** Grant or retune designed armor on the weakest slot so guns actually move Power. */
function upgradeWeakestArmor(state: GameState, minPower: number, rank: number): void {
  const { slot, item } = weakestArmorSlot(state);
  const tid = designedArmorId(slot, Math.max(2, rank), state.guardian?.class);
  const t = TEMPLATE_MAP[tid];
  if (!t || t.kind !== 'armor') return;
  const target = Math.max(minPower, t.basePower + rank * 2, (item?.power ?? 0) + 1);
  if (item && (item.templateId === tid || RARITY_RANK[item.rarity] >= RARITY_RANK[t.rarity])) {
    if (item.power < target) {
      item.power = target;
      pushLog(state, {
        kind: 'loot',
        rarity: item.rarity,
        text: `${item.name}  ·  ${item.power} Power`,
        itemId: item.id,
      });
    }
    return;
  }
  const fresh = instantiateTemplate(tid, Math.max(0, target - t.basePower), state.guardian?.class);
  if (!fresh) return;
  fresh.power = Math.max(fresh.power, target);
  makeSpaceForItem(state, slot);
  giveItem(state, fresh, true);
  if (getItem(state, fresh.id)) {
    equipItem(state, fresh.id);
    pushLog(state, {
      kind: 'loot',
      rarity: fresh.rarity,
      text: `${fresh.name}  ·  ${fresh.power} Power`,
      itemId: fresh.id,
    });
  }
}

function grantDestRankArmor(state: GameState, dest: string, rank: number): void {
  const before = guardianPower(state);
  upgradeWeakestArmor(state, highestWeaponPower(state), rank);
  if (guardianPower(state) <= before) {
    const mats = 8 + rank * 3;
    state.materials[dest] = (state.materials[dest] ?? 0) + mats;
    pushLog(state, {
      kind: 'info',
      text: `Rank ${rank} surplus · +${mats} ${MATERIAL_LABEL[dest] ?? dest}.`,
    });
  }
}

export function grantPatternXp(state: GameState, templateId: string, amount: number, silent = false): boolean {
  ensureLoopFields(state);
  const def = PATTERN_MAP[templateId];
  if (!def || amount <= 0) return false;
  if (!state.patterns[templateId]) state.patterns[templateId] = { xp: 0, finished: false };
  const p = state.patterns[templateId];
  if (p.finished) {
    state.gunsmithParts += Math.max(1, Math.round(amount / 4));
    return false;
  }
  const wasReady = p.xp >= def.xpToReady;
  p.xp = Math.min(def.xpToReady, p.xp + amount);
  const nowReady = p.xp >= def.xpToReady;
  if (nowReady && !wasReady) {
    const gun = TEMPLATE_MAP[templateId];
    pushLog(state, {
      kind: 'loot',
      rarity: gun?.rarity ?? 'legendary',
      text: `${gun?.name ?? templateId} is ready — Finish at Banshee.`,
      itemId: `pattern:${templateId}`,
    });
    return true;
  }
  return false;
}

function addMaterials(state: GameState, dest: string, amount: number): void {
  if (!dest || amount <= 0) return;
  ensureLoopFields(state);
  state.materials[dest] = (state.materials[dest] ?? 0) + amount;
}

function pickMatDest(state: GameState): string {
  ensureLoopFields(state);
  for (let i = DEST_ORDER.length - 1; i >= 0; i--) {
    const id = DEST_ORDER[i];
    if (i === 0) return id;
    const prev = DEST_ORDER[i - 1];
    const req = [0, 2, 3, 4, 5][i] ?? 2;
    if (destLevel(state, prev) >= req) return id;
  }
  return 'cosmodrome';
}

function bumpBounties(state: GameState, kind: Bounty['kind'], match: string, amt = 1): void {
  for (const v of Object.values(state.vendors)) {
    for (const b of v.bounties) {
      if (b.claimed) continue;
      if (b.kind !== kind) continue;
      if (b.match !== 'any' && b.match !== match && !match.includes(b.match)) continue;
      b.progress = Math.min(b.target, b.progress + amt);
    }
  }
}

function rollEngrams(state: GameState, act: Activity): void {
  const luck = classEngramLuck(state.guardian?.class ?? 'hunter') * (hasPerk(state, 'engrammer') ? 1.15 : 1);
  const crypt = 1 + levelFromXp(state.vendors.cryptarch?.xp ?? 0) * 0.015;
  if (Math.random() < act.engramChances.rare * luck * crypt) state.engrams.rare += 1;
  if (Math.random() < act.engramChances.legendary * luck * crypt) {
    state.engrams.legendary += 1;
    pushLog(state, { kind: 'loot', rarity: 'legendary', text: 'Legendary Engram discovered.' });
  }
  if (Math.random() < act.engramChances.exotic * luck * crypt) {
    state.engrams.exotic += 1;
    pushLog(state, { kind: 'loot', rarity: 'exotic', text: 'Exotic Engram discovered!' });
  }
}

function patternsOfRarity(rarity: Rarity): string[] {
  return PATTERN_DEFS.filter((p) => TEMPLATE_MAP[p.templateId]?.rarity === rarity).map((p) => p.templateId);
}

function decryptRewards(state: GameState, rarity: Rarity): void {
  ensureLoopFields(state);
  const glimmer = rarity === 'exotic' ? irand(40, 72) : rarity === 'legendary' ? irand(18, 34) : irand(6, 14);
  state.currencies.glimmer += glimmer;
  const dest = pickMatDest(state);
  const mats = rarity === 'exotic' ? irand(8, 14) : rarity === 'legendary' ? irand(4, 8) : irand(2, 5);
  addMaterials(state, dest, mats);

  const xpAmt = rarity === 'exotic' ? 90 : rarity === 'legendary' ? 32 : 12;
  const fed: string[] = [];
  const newlyReady: string[] = [];
  const noteFed = (id: string, becameReady: boolean) => {
    if (!fed.includes(id)) fed.push(id);
    if (becameReady && !newlyReady.includes(id)) newlyReady.push(id);
  };

  if (rarity === 'exotic') {
    const unfinished = patternsOfRarity('exotic').filter((id) => !state.patterns[id]?.finished);
    if (unfinished.length === 0) {
      state.gunsmithParts += 14;
      pushLog(state, {
        kind: 'info',
        rarity: 'exotic',
        text: `Exotic cipher spent · +14 Gunsmith Parts · +${mats} ${MATERIAL_LABEL[dest]}.`,
      });
      return;
    } else {
      const pick = unfinished[irand(0, unfinished.length - 1)];
      noteFed(pick, grantPatternXp(state, pick, xpAmt));
    }
  } else {
    const pool = patternsOfRarity('legendary').filter((id) => !state.patterns[id]?.finished);
    const src = pool.length ? pool : patternsOfRarity('legendary');
    const n = Math.min(src.length, rarity === 'legendary' ? 2 : irand(1, 2));
    const shuffled = [...src].sort(() => Math.random() - 0.5).slice(0, n);
    for (const id of shuffled) noteFed(id, grantPatternXp(state, id, xpAmt));
    if (rarity === 'legendary' && Math.random() < 0.08) {
      const exo = patternsOfRarity('exotic').filter((id) => !state.patterns[id]?.finished);
      if (exo.length) {
        const id = exo[irand(0, exo.length - 1)];
        noteFed(id, grantPatternXp(state, id, 18));
      }
    }
  }

  const inspectTid =
    newlyReady[0] ?? fed.find((id) => !state.patterns[id]?.finished) ?? fed[0];
  if (inspectTid) {
    const gun = TEMPLATE_MAP[inspectTid];
    pushLog(state, {
      kind: 'loot',
      rarity: gun?.rarity ?? rarity,
      text: `${gun?.name ?? inspectTid} familiarity.`,
      itemId: patternSheetId(inspectTid),
    });
  }
}

function giveItem(state: GameState, item: Item, silent = false): void {
  const dest = stashItem(state, item);
  if (dest === 'lost') {
    if (!silent) {
      pushLog(state, {
        kind: 'system',
        text: `Bags full. ${item.name} could not be recovered.`,
        rarity: item.rarity,
      });
    }
    return;
  }
  if (item.rarity === 'legendary') state.stats.legendaryDrops += 1;
  if (item.rarity === 'exotic') state.stats.exoticDrops += 1;
  if (!silent) {
    pushLog(state, {
      kind: 'loot',
      rarity: item.rarity,
      text: `${item.name}  ·  ${item.power} Power`,
      itemId: item.id,
    });
    if (dest === 'vault') {
      pushLog(state, {
        kind: 'system',
        text: `Inventory full. ${item.name} sent to the Vault.`,
        rarity: item.rarity,
      });
    } else if (dest === 'postmaster') {
      pushLog(state, {
        kind: 'system',
        text: `Vault full. ${item.name} sent to the Postmaster.`,
        rarity: item.rarity,
      });
    }
  }
}


const WEAPON_SLOTS: WeaponSlot[] = ['kinetic', 'energy', 'power'];

function pickFieldWeaponId(act: Activity, slot: WeaponSlot): string | null {
  const rows = (act.loot ?? []).filter((e) => {
    const tmpl = TEMPLATE_MAP[e.templateId];
    return (
      tmpl &&
      tmpl.kind === 'weapon' &&
      tmpl.slot === slot &&
      (tmpl.rarity === 'common' || tmpl.rarity === 'uncommon')
    );
  });
  if (rows.length) {
    const hit = pickWeighted(rows);
    if (hit) return hit.templateId;
  }
  const fallback: Record<WeaponSlot, string> = {
    kinetic: 'k_auto_c',
    energy: 'e_smg_c',
    power: 'p_gl_c',
  };
  return TEMPLATE_MAP[fallback[slot]] ? fallback[slot] : null;
}

/** Empty weapon slots are not allowed. Field commons only — named legendaries stay Banshee Finish. */
function fillEmptyWeaponSlots(state: GameState, act: Activity, silent: boolean): void {
  for (const slot of WEAPON_SLOTS) {
    if (getItem(state, state.equipped[slot])) continue;
    const tid = pickFieldWeaponId(act, slot);
    if (!tid) continue;
    const item = instantiateTemplate(tid, irand(0, 2), state.guardian?.class);
    if (!item) continue;
    makeSpaceForItem(state, slot);
    giveItem(state, item, silent);
    if (getItem(state, item.id)) equipItem(state, item.id);
  }
}

export function completeActivity(state: GameState, act: Activity, silent = false): void {
  ensureLoopFields(state);
  const cls = state.guardian?.class ?? 'hunter';
  const xpM = classXpMult(cls) * (hasPerk(state, 'lightwell') ? 1.1 : 1);
  const gM = classGlimmerMult(cls) * (hasPerk(state, 'siphon') || hasPerk(state, 'overflow') ? 1.12 : 1);
  const glimmer = Math.round(rand(act.glimmer[0], act.glimmer[1]) * gM);
  state.currencies.glimmer += glimmer;

  addSkillXp(state, 'vendor_banshee', Math.round(act.weaponXp * 0.35 * xpM));
  if (act.destination) addSkillXp(state, `dest_${act.destination}`, Math.round(act.destXp * xpM));
  if (act.vendor) {
    addSkillXp(state, `vendor_${act.vendor}`, Math.round(act.vendorXp * xpM));
    if (state.vendors[act.vendor]) state.vendors[act.vendor].xp += Math.round(act.vendorXp * xpM);
  }

  const weapons = equippedItems(state).filter((i) => i.kind === 'weapon');
  for (const w of weapons) {
    if (!w.weaponType) continue;
    const extra = hasPerk(state, 'cadence') ? 1.15 : 1;
    addSkillXp(state, `wpn_${w.weaponType}`, Math.round((act.weaponXp / Math.max(1, weapons.length)) * extra * xpM));
  }

  if (act.kind === 'decrypt') {
    const which =
      act.id === 'decrypt_exotic' ? 'exotic' : act.id === 'decrypt_legendary' ? 'legendary' : 'rare';
    decryptRewards(state, which);
    state.stats.engramsDecrypted += 1;
    addSkillXp(state, 'vendor_cryptarch', Math.round(act.vendorXp * xpM));
    if (state.vendors.cryptarch) state.vendors.cryptarch.xp += Math.round(act.vendorXp * xpM);
    bumpBounties(state, 'decrypt', which === 'rare' ? 'any' : 'high');
  } else {
    if (act.destination && act.materials) {
      addMaterials(state, act.destination, irand(act.materials[0], act.materials[1]));
    }
    const fam = Math.max(1, Math.round((act.patternXp ?? Math.round(act.destXp * 0.45)) * xpM));
    const feed = activityFeedPatterns(state, act);
    if (feed.length === 0) {
      state.gunsmithParts += Math.max(1, Math.round(fam / 4));
    } else {
      const amt = activityFeedOverflow(state, act) ? Math.max(1, Math.round(fam / 2)) : fam;
      for (const id of feed) grantPatternXp(state, id, amt, silent);
    }
    rollEngrams(state, act);
    fillEmptyWeaponSlots(state, act, silent);
    if (Math.random() < 0.07) {
      state.gunsmithParts += 1;
      if (!silent) pushLog(state, { kind: 'info', text: 'Field salvage · +1 Gunsmith Parts.' });
    }
    if (Math.random() < 0.012) {
      if (!silent) pushLog(state, { kind: 'info', text: 'A Ghost fragment glints in the dust.' });
    }
    bumpBounties(state, 'activity', act.tags.join(' '));
  }

  state.stats.activitiesCompleted += 1;
}

export function startAction(state: GameState, activityId: string): string | null {
  const act = ACTIVITY_MAP[activityId];
  if (!act) return 'Unknown activity.';
  if (act.kind === 'decrypt') {
    const key = act.id === 'decrypt_exotic' ? 'exotic' : act.id === 'decrypt_legendary' ? 'legendary' : 'rare';
    if (state.engrams[key] < 1) return `No ${key} engrams.`;
    state.engrams[key] -= 1;
  } else {
    const reason = activityLockedReason(state, act);
    if (reason) return reason;
  }
  const duration = activityDuration(state, act);
  const now = Date.now();
  state.activeAction = {
    activityId,
    cycleStartedAt: now,
    durationMs: duration,
    combat: makeCombat(state, act),
    lastTickAt: now,
  };
  state.lastTickAt = now;
  return null;
}

export function stopAction(state: GameState): void {
  if (state.activeAction) {
    const act = ACTIVITY_MAP[state.activeAction.activityId];
    if (act?.kind === 'decrypt') {
      const key = act.id === 'decrypt_exotic' ? 'exotic' : act.id === 'decrypt_legendary' ? 'legendary' : 'rare';
      state.engrams[key] += 1;
    }
  }
  state.activeAction = null;
}

function combatTick(state: GameState, action: ActiveAction, dt: number): boolean {
  const combat = action.combat;
  if (!combat) return false;
  const act = ACTIVITY_MAP[action.activityId];
  combat.dps = computeDps(state, act);
  if (hasPerk(state, 'voidleech')) combat.superMeter += dt * 0.012;
  else combat.superMeter += dt * 0.008;
  if (combat.superMeter >= 1 && combat.superActiveMs <= 0) {
    combat.superMeter = 0;
    combat.superActiveMs = hasPerk(state, 'solarwake') ? 3800 : 2600;
    if (state.guardian) {
      pushLog(state, { kind: 'combat', text: 'Super ignited.' });
    }
  }
  if (combat.superActiveMs > 0) combat.superActiveMs -= dt;
  const mult = combat.superActiveMs > 0 ? 3.1 : 1;
  const dmg = combat.dps * (dt / 1000) * mult;
  const enemy = currentEnemy(combat);
  if (!enemy) return true;
  enemy.hp -= dmg;
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    state.stats.enemiesDefeated += 1;
    bumpBounties(state, 'kills', act.tags.join(' '));
    combat.enemyIndex += 1;
    if (combat.enemyIndex >= combat.waves[combat.waveIndex].length) {
      combat.waveIndex += 1;
      combat.enemyIndex = 0;
    }
    if (combat.waveIndex >= combat.waves.length) return true;
  }
  return false;
}

export function tickState(state: GameState, now: number): GameState {
  const next: GameState = state;
  ensureLoopFields(next);
  enforceCaps(next);
  next.lastTickAt = now;
  if (!next.activeAction) {
    return next;
  }
  const action = next.activeAction;
  const act = ACTIVITY_MAP[action.activityId];
  if (!act) {
    next.activeAction = null;
    return next;
  }
  const tickDt = Math.min(250, Math.max(0, now - (action.lastTickAt ?? action.cycleStartedAt)));
  action.lastTickAt = now;

  if (action.combat) {
    combatTick(next, action, tickDt);
  }

  const elapsed = Math.max(0, now - action.cycleStartedAt);
  const minCycle = Math.max(action.durationMs, action.combat ? 2000 : action.durationMs);
  if (elapsed >= minCycle) {
    const window = Math.max(action.durationMs, minCycle);
    const loops = Math.min(40, Math.floor(elapsed / window));
    if (loops > 0) {
      for (let i = 0; i < loops; i++) completeActivity(next, act, i > 0 && loops > 3);
      const leftover = elapsed % window;
      const err = startAction(next, act.id);
      if (!err && next.activeAction) {
        next.activeAction.cycleStartedAt = now - leftover;
        next.activeAction.lastTickAt = now;
      } else if (err) {
        next.activeAction = null;
      }
    }
  }
  return next;
}

function emptyOffline(ms = 0, cycles = 0, activityName = ''): OfflineReport {
  return { ms, cycles, activityName, glimmer: 0, destXp: {}, materials: {}, patternTicks: [] };
}

function liveWatermark(state: GameState): number {
  return state.lastTickAt || state.activeAction?.lastTickAt || state.lastSavedAt || 0;
}

function stampTick(state: GameState, now: number): void {
  state.lastTickAt = now;
  if (state.activeAction) state.activeAction.lastTickAt = now;
}

export function applyOffline(state: GameState, now: number): OfflineReport {
  ensureLoopFields(state);
  if (!state.activeAction) {
    stampTick(state, now);
    return emptyOffline();
  }
  const cap = (state.settings.offlineCapHours ?? OFFLINE_CAP_HOURS_DEFAULT) * 3600 * 1000;
  const away = readAwayWatermark();
  const origin = away > 0 ? away : liveWatermark(state);
  const elapsed = clamp(now - origin, 0, cap);
  if (elapsed < 1500) {
    stampTick(state, now);
    return emptyOffline(elapsed, 0);
  }
  const act = ACTIVITY_MAP[state.activeAction.activityId];
  if (!act) {
    state.activeAction = null;
    stampTick(state, now);
    return emptyOffline(elapsed, 0);
  }
  const dur = Math.max(activityDuration(state, act), act.combat ? 2000 : 0);
  let cycles = Math.floor(elapsed / Math.max(1, dur));
  cycles = Math.min(cycles, 2500);

  const glimmer0 = state.currencies.glimmer;
  const dest0: Record<string, number> = {};
  const mat0: Record<string, number> = {};
  const pat0: Record<string, number> = {};
  for (const id of DEST_MAT_IDS) {
    dest0[id] = state.skills[`dest_${id}`]?.xp ?? 0;
    mat0[id] = state.materials[id] ?? 0;
  }
  for (const def of PATTERN_DEFS) {
    pat0[def.templateId] = state.patterns[def.templateId]?.xp ?? 0;
  }

  for (let i = 0; i < cycles; i++) completeActivity(state, act, true);
  if (cycles > 0) {
    pushLog(state, {
      kind: 'system',
      text: `Offline: ${formatDuration(elapsed)} · ${cycles} completions of ${act.name}.`,
    });
    const err = startAction(state, act.id);
    if (err) state.activeAction = null;
  }
  stampTick(state, now);

  const destXp: Record<string, number> = {};
  const materials: Record<string, number> = {};
  for (const id of DEST_MAT_IDS) {
    const dx = (state.skills[`dest_${id}`]?.xp ?? 0) - dest0[id];
    const mx = (state.materials[id] ?? 0) - mat0[id];
    if (dx > 0) destXp[id] = dx;
    if (mx > 0) materials[id] = mx;
  }
  const patternTicks: OfflineReport['patternTicks'] = [];
  for (const def of PATTERN_DEFS) {
    const xp = (state.patterns[def.templateId]?.xp ?? 0) - (pat0[def.templateId] ?? 0);
    if (xp > 0) {
      const gun = TEMPLATE_MAP[def.templateId];
      patternTicks.push({
        name: gun?.name ?? def.templateId,
        xp,
        ready: patternIsReady(state, def.templateId) || Boolean(state.patterns[def.templateId]?.finished),
      });
    }
  }
  return {
    ms: elapsed,
    cycles,
    activityName: act.name,
    glimmer: Math.max(0, state.currencies.glimmer - glimmer0),
    destXp,
    materials,
    patternTicks,
  };
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Compact remaining-time for the HUD chase (cycles × duration). */
export function formatEta(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 45) return `~${Math.max(1, s)}s`;
  const m = Math.max(1, Math.round(s / 60));
  if (m < 90) return `~${m}m`;
  const h = Math.max(1, Math.round(m / 60));
  return `~${h}h`;
}

/** Whole-second countdown (ceil) so a ~2s cycle reads 2, 1, 0 — never stuck at 0s while filling. */
export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function formatRate(act: Activity, state: GameState): { xp: number; glimmer: number } {
  const dur = activityDuration(state, act) / 3600000;
  const xpM = classXpMult(state.guardian?.class ?? 'hunter');
  const gM = classGlimmerMult(state.guardian?.class ?? 'hunter');
  const gAvg = ((act.glimmer[0] + act.glimmer[1]) / 2) * gM;
  return {
    xp: Math.round((act.xp * xpM) / dur),
    glimmer: Math.round(gAvg / dur),
  };
}

export function dismantleItem(state: GameState, id: string): void {
  if (isEquipped(state, id)) return;
  ensureBags(state);
  ensureLoopFields(state);
  let bag: Item[] | null = null;
  let idx = state.inventory.findIndex((i) => i.id === id);
  if (idx >= 0) bag = state.inventory;
  else {
    idx = state.vault.findIndex((i) => i.id === id);
    if (idx >= 0) bag = state.vault;
    else {
      idx = state.postmaster.findIndex((i) => i.id === id);
      if (idx >= 0) bag = state.postmaster;
    }
  }
  if (!bag || idx < 0) return;
  const item = bag[idx];
  const shard =
    item.rarity === 'exotic' ? 8 : item.rarity === 'legendary' ? 3 : item.rarity === 'rare' ? 0 : 0;
  const glimmer =
    item.rarity === 'exotic'
      ? 80
      : item.rarity === 'legendary'
        ? 25
        : item.rarity === 'rare'
          ? 12
          : item.rarity === 'uncommon'
            ? 6
            : 3;
  state.currencies.legendaryShards += shard;
  state.currencies.glimmer += glimmer;
  let extra = '';
  const pat = PATTERN_MAP[item.templateId];
  if (pat && (item.rarity === 'legendary' || item.rarity === 'exotic')) {
    const parts = item.rarity === 'exotic' ? 10 : 4;
    const mats = item.rarity === 'exotic' ? 8 : 4;
    state.gunsmithParts += parts;
    addMaterials(state, pat.destination, mats);
    extra = ` · +${parts} Parts · +${mats} ${MATERIAL_LABEL[pat.destination]}`;
  }
  bag.splice(idx, 1);
  state.stats.itemsDismantled += 1;
  bumpBounties(state, 'dismantle', 'any');
  pushLog(state, {
    kind: 'info',
    text: `Dismantled ${item.name} · +${glimmer} Glimmer${shard ? ` · +${shard} Shards` : ''}${extra}.`,
  });
}

export function equipItem(state: GameState, id: string): void {
  const item = getItem(state, id);
  if (!item) return;
  ensureBags(state);
  if (!state.inventory.some((i) => i.id === id)) {
    if (state.inventory.length >= INVENTORY_CAP) {
      const movable = state.inventory.find((i) => !isEquipped(state, i.id) && i.id !== id);
      if (movable) vaultItem(state, movable.id);
    }
    if (state.inventory.length >= INVENTORY_CAP) makeSpaceForItem(state, item.slot, id);
    if (state.inventory.length >= INVENTORY_CAP) return;
    const vaultIdx = state.vault.findIndex((i) => i.id === id);
    const postIdx = state.postmaster.findIndex((i) => i.id === id);
    if (vaultIdx >= 0) {
      const [it] = state.vault.splice(vaultIdx, 1);
      state.inventory.push(it);
    } else if (postIdx >= 0) {
      const [it] = state.postmaster.splice(postIdx, 1);
      state.inventory.push(it);
    } else {
      return;
    }
  }
  state.equipped[item.slot] = id;
}

export function vaultItem(state: GameState, id: string): void {
  if (Object.values(state.equipped).includes(id)) return;
  const idx = state.inventory.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const [item] = state.inventory.splice(idx, 1);
  ensureBags(state);
  if (state.vault.length < VAULT_CAP) {
    state.vault.push(item);
    return;
  }
  if (state.postmaster.length < POSTMASTER_CAP) {
    state.postmaster.push(item);
    pushLog(state, {
      kind: 'system',
      text: `Vault full. ${item.name} sent to the Postmaster.`,
      rarity: item.rarity,
    });
    return;
  }
  state.inventory.push(item);
  pushLog(state, { kind: 'system', text: 'Vault and Postmaster are full.' });
}

export function pullVault(state: GameState, id: string): void {
  if (state.inventory.length >= INVENTORY_CAP) return;
  const idx = state.vault.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const [item] = state.vault.splice(idx, 1);
  state.inventory.push(item);
}

export function collectPostmaster(state: GameState, id: string): void {
  ensureBags(state);
  const idx = state.postmaster.findIndex((i) => i.id === id);
  if (idx < 0) return;
  if (state.inventory.length >= INVENTORY_CAP) {
    pushLog(state, { kind: 'system', text: 'Inventory full — make space to collect from the Postmaster.' });
    return;
  }
  const [item] = state.postmaster.splice(idx, 1);
  state.inventory.push(item);
}

export function claimBounty(state: GameState, vendorId: string, bountyId: string): void {
  const v = state.vendors[vendorId];
  if (!v) return;
  const b = v.bounties.find((x) => x.id === bountyId);
  if (!b || b.claimed || b.progress < b.target) return;
  b.claimed = true;
  state.currencies.glimmer += b.rewardGlimmer;
  state.currencies.legendaryShards += b.rewardShards;
  addSkillXp(state, `vendor_${vendorId}`, b.rewardVendorXp);
  v.xp += b.rewardVendorXp;
  pushLog(state, {
    kind: 'info',
    rarity: 'rare',
    text: `Bounty complete: ${b.name} · +${b.rewardGlimmer} Glimmer.`,
  });
}

export function claimPackage(state: GameState, vendorId: string): void {
  const v = state.vendors[vendorId];
  if (!v || v.packagesReady < 1) return;
  ensureLoopFields(state);
  const n = Math.min(PACKAGE_READY_CAP, v.packagesReady);
  v.packagesReady = 0;
  let dest = pickMatDest(state);
  let mats = 0;
  let parts = 0;
  let glimmer = 0;
  for (let i = 0; i < n; i++) {
    dest = pickMatDest(state);
    const m = irand(14, 24);
    addMaterials(state, dest, m);
    mats += m;
    if (vendorId === 'banshee') {
      state.gunsmithParts += 6;
      parts += 6;
    }
    state.currencies.glimmer += 50;
    glimmer += 50;
  }
  const extra = parts > 0 ? ` · +${parts} Gunsmith Parts` : '';
  pushLog(state, {
    kind: 'info',
    rarity: 'legendary',
    text: `Rank-up package from ${vendorId}${n > 1 ? ` x${n}` : ''} · +${mats} ${MATERIAL_LABEL[dest]} · +${glimmer} Glimmer${extra}.`,
  });
}

export function instantDecrypt(state: GameState, rarity: 'rare' | 'legendary' | 'exotic'): string | null {
  const key = rarity;
  if (state.engrams[key] < 1) return 'No engrams.';
  const cost = rarity === 'exotic' ? 250 : rarity === 'legendary' ? 80 : 20;
  if (state.currencies.glimmer < cost) return `Need ${cost} Glimmer.`;
  ensureLoopFields(state);
  state.engrams[key] -= 1;
  state.currencies.glimmer -= cost;
  decryptRewards(state, rarity);
  state.stats.engramsDecrypted += 1;
  addSkillXp(state, 'vendor_cryptarch', rarity === 'exotic' ? 40 : rarity === 'legendary' ? 22 : 12);
  if (state.vendors.cryptarch) {
    state.vendors.cryptarch.xp += rarity === 'exotic' ? 40 : rarity === 'legendary' ? 22 : 12;
  }
  bumpBounties(state, 'decrypt', rarity === 'rare' ? 'any' : 'high');
  return null;
}

export function finishPattern(state: GameState, templateId: string): string | null {
  ensureLoopFields(state);
  const def = PATTERN_MAP[templateId];
  const gun = TEMPLATE_MAP[templateId];
  if (!def || !gun) return 'Unknown pattern.';
  const p = state.patterns[templateId];
  if (!p) return 'Unknown pattern.';
  if (p.finished) return 'Already finished at the Foundry.';
  if (p.xp < def.xpToReady) return 'Pattern is not ready.';
  const have = state.materials[def.finishCost.dest] ?? 0;
  if (have < def.finishCost.mats) {
    return `Need ${def.finishCost.mats} ${MATERIAL_LABEL[def.finishCost.dest]}.`;
  }
  if (state.currencies.glimmer < def.finishCost.glimmer) {
    return `Need ${def.finishCost.glimmer} Glimmer.`;
  }
  state.materials[def.finishCost.dest] -= def.finishCost.mats;
  state.currencies.glimmer -= def.finishCost.glimmer;
  p.finished = true;
  p.xp = def.xpToReady;
  const item = instantiateTemplate(templateId, 8 + destLevel(state, def.destination) * 2, state.guardian?.class);
  let parkedInInventory = false;
  if (item) {
    const worn = getItem(state, state.equipped[item.slot]);
    const autoEquip = !worn || worn.rarity === 'common' || worn.rarity === 'uncommon';
    makeSpaceForItem(state, item.slot, autoEquip ? undefined : worn?.id);
    giveItem(state, item, true);
    const held = getItem(state, item.id);
    if (!held) {
      // Last resort: dismantle more junk and retry.
      while (!getItem(state, item.id) && lowestRarityUnequippedId(state, autoEquip ? undefined : worn?.id)) {
        const junk = lowestRarityUnequippedId(state, autoEquip ? undefined : worn?.id);
        if (!junk || junk === item.id) break;
        dismantleItem(state, junk);
        if (bagsHaveSpace(state)) giveItem(state, item, true);
      }
    }
    if (getItem(state, item.id)) {
      if (autoEquip) equipItem(state, item.id);
      else parkedInInventory = true;
    } else {
      // Absolutely must not lose the gun — drop into inventory past cap, then enforce.
      state.inventory.unshift(item);
      if (autoEquip) state.equipped[item.slot] = item.id;
      else parkedInInventory = true;
    }
    upgradeWeakestArmor(state, item.power, destLevel(state, def.destination));
  }
  addSkillXp(state, 'vendor_banshee', 24);
  if (state.vendors.banshee) state.vendors.banshee.xp += 24;
  const liveGun = item ? getItem(state, item.id) : undefined;
  pushLog(state, {
    kind: 'loot',
    rarity: gun.rarity,
    text: parkedInInventory
      ? `${gun.name} finished at the Foundry · in inventory.`
      : `${gun.name} finished at the Foundry.`,
    itemId: liveGun?.id ?? patternSheetId(templateId),
  });
  return null;
}

export function calibrate(state: GameState, destId: string): string | null {
  ensureLoopFields(state);
  if (!DEST_MAT_IDS.includes(destId as (typeof DEST_MAT_IDS)[number])) return 'Unknown destination.';
  const current = state.calibrations[destId] ?? 0;
  if (current >= CALIBRATION_MAX) return 'Calibration maxed.';
  const cost = calibrationCost(current);
  if ((state.materials[destId] ?? 0) < cost.mats) {
    return `Need ${cost.mats} ${MATERIAL_LABEL[destId]}.`;
  }
  if (state.currencies.glimmer < cost.glimmer) return `Need ${cost.glimmer} Glimmer.`;
  state.materials[destId] -= cost.mats;
  state.currencies.glimmer -= cost.glimmer;
  state.calibrations[destId] = current + 1;
  pushLog(state, {
    kind: 'info',
    rarity: 'rare',
    text: `${MATERIAL_LABEL[destId]} calibration ${current + 1}/${CALIBRATION_MAX}. Idle speed up.`,
  });
  return null;
}

export function refreshBounties(state: GameState, vendorId: string): void {
  const v = state.vendors[vendorId];
  if (!v) return;
  const cost = 40;
  if (state.currencies.glimmer < cost) return;
  state.currencies.glimmer -= cost;
  v.bounties = rollBounties(vendorId);
}

export function weaponTypeLabel(t?: WeaponType): string {
  return WEAPON_TYPES.find((w) => w.id === t)?.label ?? 'Weapon';
}

export function hoursPer(ms: number, perCycle: number): number {
  if (ms <= 0) return 0;
  return Math.round((3600000 / ms) * perCycle);
}
