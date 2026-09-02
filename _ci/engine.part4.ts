
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
