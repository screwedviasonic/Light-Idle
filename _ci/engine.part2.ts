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
