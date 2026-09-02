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
