import type {
  Activity,
  Bounty,
  GuardianClass,
  ItemTemplate,
  PatternDef,
  Perk,
  WeaponType,
} from '../types';

export const SAVE_KEY = 'light-idle-save-v3';
export const SAVE_VERSION = 3;
export const OFFLINE_CAP_HOURS_DEFAULT = 24;
export const INVENTORY_CAP = 60;
export const VAULT_CAP = 80;
export const POSTMASTER_CAP = 40;
export const PACKAGE_READY_CAP = 3;
export const XP_PER_LEVEL = 100;

export const CLASS_META: Record<
  GuardianClass,
  {
    label: string;
    accent: string;
    blurb: string;
    idle: string;
    subclass: string;
    element: 'arc' | 'solar' | 'void';
    subclassFlavor: string;
  }
> = {
  hunter: {
    label: 'Hunter',
    accent: '#3aa36a',
    blurb: 'Fast blades of the wild. Patrols and Lost Sectors run quicker.',
    idle: '+18% patrol / Lost Sector speed',
    subclass: 'Arc Stride',
    element: 'arc',
    subclassFlavor: 'A thin line of lightning at the edge of the map.',
  },
  titan: {
    label: 'Titan',
    accent: '#5b7fd4',
    blurb: 'Walls of the Last City. More Glimmer and heavier armor drops.',
    idle: '+28% Glimmer · better armor Power',
    subclass: 'Solar Ward',
    element: 'solar',
    subclassFlavor: 'Hold the line. Burn what crosses it.',
  },
  warlock: {
    label: 'Warlock',
    accent: '#c45a3a',
    blurb: 'Scholars of the Light. More XP and kinder engram odds.',
    idle: '+22% XP · +engram luck',
    subclass: 'Void Gate',
    element: 'void',
    subclassFlavor: 'A circle that hungers, then gives.',
  },
};

export const RARITY_COLOR: Record<string, string> = {
  common: '#c9c6c0',
  uncommon: '#5ad68a',
  rare: '#4aa3ff',
  legendary: '#c9a0ff',
  exotic: '#e8c547',
};

export const RARITY_LABEL: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
  exotic: 'Exotic',
};

export const WEAPON_TYPES: { id: WeaponType; label: string }[] = [
  { id: 'auto', label: 'Auto Rifle' },
  { id: 'handCannon', label: 'Hand Cannon' },
  { id: 'pulse', label: 'Pulse Rifle' },
  { id: 'scout', label: 'Scout Rifle' },
  { id: 'shotgun', label: 'Shotgun' },
  { id: 'sniper', label: 'Sniper Rifle' },
  { id: 'fusion', label: 'Fusion Rifle' },
  { id: 'rocket', label: 'Rocket Launcher' },
  { id: 'sword', label: 'Sword' },
  { id: 'bow', label: 'Bow' },
  { id: 'smg', label: 'Submachine Gun' },
  { id: 'grenadeLauncher', label: 'Grenade Launcher' },
  { id: 'lmg', label: 'Machine Gun' },
  { id: 'sidearm', label: 'Sidearm' },
  { id: 'trace', label: 'Trace Rifle' },
];

export const DESTINATIONS = [
  { id: 'cosmodrome', label: 'Cosmodrome', order: 1 },
  { id: 'edz', label: 'EDZ', order: 2 },
  { id: 'nessus', label: 'Nessus', order: 3 },
  { id: 'moon', label: 'Moon', order: 4 },
  { id: 'europa', label: 'Europa', order: 5 },
  { id: 'tower', label: 'The Tower', order: 0 },
] as const;

export const DEST_MAT_IDS = ['cosmodrome', 'edz', 'nessus', 'moon', 'europa'] as const;
export type DestMatId = (typeof DEST_MAT_IDS)[number];

export const MATERIAL_LABEL: Record<string, string> = {
  cosmodrome: 'Cosmo Scrap',
  edz: 'EDZ Alloy',
  nessus: 'Nessus Milkstone',
  moon: 'Moon Dustglass',
  europa: 'Europa Rime',
};

export const CALIBRATION_MAX = 5;
export const GHOST_REPORT_MIN_MS = 8000;

export function calibrationCost(level: number): { mats: number; glimmer: number } {
  return { mats: 20 + level * 18, glimmer: 60 + level * 50 };
}

export const PATTERN_DEFS: PatternDef[] = [
  { templateId: 'k_auto_l', destination: 'cosmodrome', xpToReady: 200, finishCost: { dest: 'cosmodrome', mats: 30, glimmer: 100 } },
  { templateId: 'k_smg_l', destination: 'cosmodrome', xpToReady: 360, finishCost: { dest: 'cosmodrome', mats: 50, glimmer: 180 } },
  { templateId: 'k_pulse_l', destination: 'edz', xpToReady: 420, finishCost: { dest: 'edz', mats: 55, glimmer: 220 } },
  { templateId: 'e_bow_l', destination: 'edz', xpToReady: 480, finishCost: { dest: 'edz', mats: 60, glimmer: 240 } },
  { templateId: 'k_hc_l', destination: 'nessus', xpToReady: 620, finishCost: { dest: 'nessus', mats: 70, glimmer: 300 } },
  { templateId: 'e_fusion_l', destination: 'nessus', xpToReady: 680, finishCost: { dest: 'nessus', mats: 75, glimmer: 320 } },
  { templateId: 'k_scout_l', destination: 'moon', xpToReady: 820, finishCost: { dest: 'moon', mats: 90, glimmer: 400 } },
  { templateId: 'e_shot_l', destination: 'moon', xpToReady: 860, finishCost: { dest: 'moon', mats: 90, glimmer: 400 } },
  { templateId: 'e_sniper_l', destination: 'moon', xpToReady: 940, finishCost: { dest: 'moon', mats: 100, glimmer: 450 } },
  { templateId: 'e_trace_l', destination: 'europa', xpToReady: 1100, finishCost: { dest: 'europa', mats: 110, glimmer: 520 } },
  { templateId: 'p_sword_l', destination: 'europa', xpToReady: 1150, finishCost: { dest: 'europa', mats: 120, glimmer: 550 } },
  { templateId: 'p_rocket_l', destination: 'europa', xpToReady: 1200, finishCost: { dest: 'europa', mats: 130, glimmer: 580 } },
  { templateId: 'p_gl_l', destination: 'europa', xpToReady: 1180, finishCost: { dest: 'europa', mats: 120, glimmer: 540 } },
  { templateId: 'p_lmg_l', destination: 'europa', xpToReady: 1180, finishCost: { dest: 'europa', mats: 120, glimmer: 540 } },
  { templateId: 'e_fusion_x', destination: 'nessus', xpToReady: 1600, finishCost: { dest: 'nessus', mats: 160, glimmer: 800 } },
  { templateId: 'k_hc_x', destination: 'moon', xpToReady: 1800, finishCost: { dest: 'moon', mats: 180, glimmer: 900 } },
  { templateId: 'k_scout_x', destination: 'europa', xpToReady: 2000, finishCost: { dest: 'europa', mats: 200, glimmer: 1000 } },
  { templateId: 'e_bow_x', destination: 'europa', xpToReady: 2000, finishCost: { dest: 'europa', mats: 200, glimmer: 1000 } },
  { templateId: 'p_rocket_x', destination: 'europa', xpToReady: 2400, finishCost: { dest: 'europa', mats: 240, glimmer: 1200 } },
  { templateId: 'p_sword_x', destination: 'europa', xpToReady: 2400, finishCost: { dest: 'europa', mats: 240, glimmer: 1200 } },
];

export const PATTERN_MAP = Object.fromEntries(PATTERN_DEFS.map((p) => [p.templateId, p]));

export const VENDORS = [
  {
    id: 'zavala',
    name: 'Zavala',
    title: 'Vanguard Commander',
    desc: 'Strikes, Nightfalls, and the long war.',
    skill: 'vendor_zavala',
  },
  {
    id: 'shaxx',
    name: 'Shaxx',
    title: 'Crucible Handler',
    desc: 'Lord of the Crucible. Bring him glory.',
    skill: 'vendor_shaxx',
  },
  {
    id: 'drifter',
    name: 'Drifter',
    title: 'Gambit Host',
    desc: 'Motes, invaders, and bad ideas that work.',
    skill: 'vendor_drifter',
  },
  {
    id: 'banshee',
    name: 'Banshee-44',
    title: 'Gunsmith',
    desc: 'If it fires, he remembers how to make it.',
    skill: 'vendor_banshee',
  },
  {
    id: 'cryptarch',
    name: 'Rahool',
    title: 'Cryptarch',
    desc: 'Engrams in. Familiarity and materials out. Always.',
    skill: 'vendor_cryptarch',
  },
] as const;

export const SKILL_META: Record<string, { label: string; group: string }> = {
  dest_cosmodrome: { label: 'Cosmodrome', group: 'Destination' },
  dest_edz: { label: 'EDZ', group: 'Destination' },
  dest_nessus: { label: 'Nessus', group: 'Destination' },
  dest_moon: { label: 'Moon', group: 'Destination' },
  dest_europa: { label: 'Europa', group: 'Destination' },
  vendor_zavala: { label: 'Vanguard (Zavala)', group: 'Vendor' },
  vendor_shaxx: { label: 'Crucible (Shaxx)', group: 'Vendor' },
  vendor_drifter: { label: 'Gambit (Drifter)', group: 'Vendor' },
  vendor_banshee: { label: 'Gunsmith (Banshee)', group: 'Vendor' },
  vendor_cryptarch: { label: 'Cryptarch', group: 'Vendor' },
  wpn_auto: { label: 'Auto Rifle', group: 'Weapon Mastery' },
  wpn_handCannon: { label: 'Hand Cannon', group: 'Weapon Mastery' },
  wpn_pulse: { label: 'Pulse Rifle', group: 'Weapon Mastery' },
  wpn_scout: { label: 'Scout Rifle', group: 'Weapon Mastery' },
  wpn_shotgun: { label: 'Shotgun', group: 'Weapon Mastery' },
  wpn_sniper: { label: 'Sniper Rifle', group: 'Weapon Mastery' },
  wpn_fusion: { label: 'Fusion Rifle', group: 'Weapon Mastery' },
  wpn_rocket: { label: 'Rocket Launcher', group: 'Weapon Mastery' },
  wpn_sword: { label: 'Sword', group: 'Weapon Mastery' },
  wpn_bow: { label: 'Bow', group: 'Weapon Mastery' },
  wpn_smg: { label: 'Submachine Gun', group: 'Weapon Mastery' },
  wpn_grenadeLauncher: { label: 'Grenade Launcher', group: 'Weapon Mastery' },
  wpn_lmg: { label: 'Machine Gun', group: 'Weapon Mastery' },
  wpn_sidearm: { label: 'Sidearm', group: 'Weapon Mastery' },
  wpn_trace: { label: 'Trace Rifle', group: 'Weapon Mastery' },
};

export const ALL_SKILL_IDS = Object.keys(SKILL_META);

export const PERKS: Record<string, Perk> = {
  swift: { id: 'swift', name: 'Swift Frame', desc: 'Slightly faster idle combat.' },
  heavy: { id: 'heavy', name: 'Heavy Frame', desc: 'Bonus Power on this piece.' },
  overflow: { id: 'overflow', name: 'Overflow Chamber', desc: '+Glimmer from combat.' },
  rending: { id: 'rending', name: 'Rending Edge', desc: 'Bonus DPS vs majors.' },
  lightwell: { id: 'lightwell', name: 'Lightwell', desc: '+XP from this activity type.' },
  siphon: { id: 'siphon', name: 'Glimmer Siphon', desc: 'Chance for bonus Glimmer.' },
  cadence: { id: 'cadence', name: 'Precision Cadence', desc: 'Weapon mastery XP up.' },
  voidleech: { id: 'voidleech', name: 'Void Leech', desc: 'Super meter fills faster.' },
  solarwake: { id: 'solarwake', name: 'Solar Wake', desc: 'Burst Super lasts longer.' },
  conductor: { id: 'conductor', name: 'Arc Conductor', desc: 'Chain damage in waves.' },
  steady: { id: 'steady', name: 'Steady Hand', desc: 'Less Power penalty when under-level.' },
  harvest: { id: 'harvest', name: 'Field Harvest', desc: 'Better patrol loot odds.' },
  bulwark: { id: 'bulwark', name: 'Bulwark Weave', desc: '+Resilience while equipped.' },
  stride: { id: 'stride', name: 'Stride Weave', desc: '+Mobility while equipped.' },
  mend: { id: 'mend', name: 'Mending Weave', desc: '+Recovery while equipped.' },
  engrammer: { id: 'engrammer', name: 'Cipher Eye', desc: 'Tiny engram luck bump.' },
};

const P = (...ids: string[]) => ids.map((id) => PERKS[id]);

export const TEMPLATES: ItemTemplate[] = [
  // Kinetic
  { id: 'k_auto_c', name: 'Frontier Line', kind: 'weapon', rarity: 'common', slot: 'kinetic', weaponType: 'auto', element: 'kinetic', perks: [], basePower: 8 },
  { id: 'k_hc_c', name: 'Dust Road', kind: 'weapon', rarity: 'common', slot: 'kinetic', weaponType: 'handCannon', element: 'kinetic', perks: [], basePower: 8 },
  { id: 'k_side_c', name: 'Outpost Click', kind: 'weapon', rarity: 'common', slot: 'kinetic', weaponType: 'sidearm', element: 'kinetic', perks: [], basePower: 7 },
  { id: 'k_pulse_u', name: 'Broken Circuit', kind: 'weapon', rarity: 'uncommon', slot: 'kinetic', weaponType: 'pulse', element: 'kinetic', perks: P('swift'), basePower: 14 },
  { id: 'k_scout_u', name: 'Long Acre', kind: 'weapon', rarity: 'uncommon', slot: 'kinetic', weaponType: 'scout', element: 'kinetic', perks: P('steady'), basePower: 15 },
  { id: 'k_auto_r', name: 'Pale Meridian', kind: 'weapon', rarity: 'rare', slot: 'kinetic', weaponType: 'auto', element: 'kinetic', perks: P('cadence'), basePower: 28 },
  { id: 'k_hc_r', name: 'Midnight Circuit', kind: 'weapon', rarity: 'rare', slot: 'kinetic', weaponType: 'handCannon', element: 'kinetic', perks: P('overflow'), basePower: 30 },
  { id: 'k_scout_r', name: 'Ashen Chord', kind: 'weapon', rarity: 'rare', slot: 'kinetic', weaponType: 'scout', element: 'kinetic', perks: P('harvest'), basePower: 29 },
  { id: 'k_auto_l', name: 'Iron Hymn', kind: 'weapon', rarity: 'legendary', slot: 'kinetic', weaponType: 'auto', element: 'kinetic', perks: P('cadence', 'heavy'), basePower: 55 },
  { id: 'k_hc_l', name: "Oathkeeper's Due", kind: 'weapon', rarity: 'legendary', slot: 'kinetic', weaponType: 'handCannon', element: 'kinetic', perks: P('rending', 'overflow'), basePower: 58 },
  { id: 'k_pulse_l', name: 'Vesper Thread', kind: 'weapon', rarity: 'legendary', slot: 'kinetic', weaponType: 'pulse', element: 'kinetic', perks: P('swift', 'lightwell'), basePower: 56 },
  { id: 'k_scout_l', name: 'Horizon Cutter', kind: 'weapon', rarity: 'legendary', slot: 'kinetic', weaponType: 'scout', element: 'kinetic', perks: P('steady', 'harvest'), basePower: 57 },
  { id: 'k_smg_l', name: 'Gilded Fracture', kind: 'weapon', rarity: 'legendary', slot: 'kinetic', weaponType: 'smg', element: 'kinetic', perks: P('swift', 'siphon'), basePower: 54 },
  { id: 'k_hc_x', name: 'Last Argument', kind: 'weapon', rarity: 'exotic', slot: 'kinetic', weaponType: 'handCannon', element: 'kinetic', perks: P('rending', 'voidleech'), basePower: 90 },
  { id: 'k_scout_x', name: 'Auric Horizon', kind: 'weapon', rarity: 'exotic', slot: 'kinetic', weaponType: 'scout', element: 'kinetic', perks: P('harvest', 'engrammer'), basePower: 92 },

  // Energy
  { id: 'e_smg_c', name: 'Static Needle', kind: 'weapon', rarity: 'common', slot: 'energy', weaponType: 'smg', element: 'arc', perks: [], basePower: 8 },
  { id: 'e_side_c', name: 'Spark Cap', kind: 'weapon', rarity: 'common', slot: 'energy', weaponType: 'sidearm', element: 'solar', perks: [], basePower: 7 },
  { id: 'e_fusion_u', name: 'Glass Current', kind: 'weapon', rarity: 'uncommon', slot: 'energy', weaponType: 'fusion', element: 'arc', perks: P('conductor'), basePower: 16 },
  { id: 'e_bow_u', name: 'Ember Spine', kind: 'weapon', rarity: 'uncommon', slot: 'energy', weaponType: 'bow', element: 'solar', perks: P('steady'), basePower: 15 },
  { id: 'e_auto_r', name: 'Solar Wake', kind: 'weapon', rarity: 'rare', slot: 'energy', weaponType: 'auto', element: 'solar', perks: P('solarwake'), basePower: 30 },
  { id: 'e_trace_r', name: 'Lattice Light', kind: 'weapon', rarity: 'rare', slot: 'energy', weaponType: 'trace', element: 'void', perks: P('voidleech'), basePower: 31 },
  { id: 'e_shot_r', name: 'Breach Courtesy', kind: 'weapon', rarity: 'rare', slot: 'energy', weaponType: 'shotgun', element: 'arc', perks: P('rending'), basePower: 29 },
  { id: 'e_shot_l', name: 'Threshold', kind: 'weapon', rarity: 'legendary', slot: 'energy', weaponType: 'shotgun', element: 'solar', perks: P('rending', 'heavy'), basePower: 56 },
  { id: 'e_fusion_l', name: 'Storm Ledger', kind: 'weapon', rarity: 'legendary', slot: 'energy', weaponType: 'fusion', element: 'arc', perks: P('conductor', 'cadence'), basePower: 57 },
  { id: 'e_bow_l', name: "Seraph's Whisper", kind: 'weapon', rarity: 'legendary', slot: 'energy', weaponType: 'bow', element: 'void', perks: P('voidleech', 'steady'), basePower: 58 },
  { id: 'e_sniper_l', name: 'Oath of the Void', kind: 'weapon', rarity: 'legendary', slot: 'energy', weaponType: 'sniper', element: 'void', perks: P('rending', 'lightwell'), basePower: 60 },
  { id: 'e_trace_l', name: 'Prism River', kind: 'weapon', rarity: 'legendary', slot: 'energy', weaponType: 'trace', element: 'strand', perks: P('siphon', 'cadence'), basePower: 55 },
  { id: 'e_fusion_x', name: 'Singularity Coil', kind: 'weapon', rarity: 'exotic', slot: 'energy', weaponType: 'fusion', element: 'void', perks: P('voidleech', 'conductor'), basePower: 94 },
  { id: 'e_bow_x', name: 'Crown of Embers', kind: 'weapon', rarity: 'exotic', slot: 'energy', weaponType: 'bow', element: 'solar', perks: P('solarwake', 'engrammer'), basePower: 93 },

  // Power
  { id: 'p_gl_c', name: 'Crowd Control', kind: 'weapon', rarity: 'common', slot: 'power', weaponType: 'grenadeLauncher', element: 'solar', perks: [], basePower: 10 },
  { id: 'p_sword_u', name: 'Edge of Duty', kind: 'weapon', rarity: 'uncommon', slot: 'power', weaponType: 'sword', element: 'arc', perks: P('swift'), basePower: 18 },
  { id: 'p_rocket_r', name: 'Skyfall Protocol', kind: 'weapon', rarity: 'rare', slot: 'power', weaponType: 'rocket', element: 'solar', perks: P('heavy'), basePower: 34 },
  { id: 'p_lmg_r', name: 'Sustained Verdict', kind: 'weapon', rarity: 'rare', slot: 'power', weaponType: 'lmg', element: 'void', perks: P('cadence'), basePower: 33 },
  { id: 'p_sword_l', name: 'Oathsteel', kind: 'weapon', rarity: 'legendary', slot: 'power', weaponType: 'sword', element: 'stasis', perks: P('rending', 'swift'), basePower: 62 },
  { id: 'p_rocket_l', name: 'World-Eater', kind: 'weapon', rarity: 'legendary', slot: 'power', weaponType: 'rocket', element: 'solar', perks: P('heavy', 'overflow'), basePower: 64 },
  { id: 'p_gl_l', name: 'Breach Hymn', kind: 'weapon', rarity: 'legendary', slot: 'power', weaponType: 'grenadeLauncher', element: 'arc', perks: P('conductor', 'siphon'), basePower: 60 },
  { id: 'p_lmg_l', name: 'Long Thunder', kind: 'weapon', rarity: 'legendary', slot: 'power', weaponType: 'lmg', element: 'arc', perks: P('cadence', 'heavy'), basePower: 61 },
  { id: 'p_rocket_x', name: 'Eclipse Protocol', kind: 'weapon', rarity: 'exotic', slot: 'power', weaponType: 'rocket', element: 'void', perks: P('voidleech', 'heavy'), basePower: 100 },
  { id: 'p_sword_x', name: 'First Light', kind: 'weapon', rarity: 'exotic', slot: 'power', weaponType: 'sword', element: 'solar', perks: P('solarwake', 'rending'), basePower: 98 },

  // Armor — common through exotic
  { id: 'h_helm_c', name: 'Fieldweave Helm', kind: 'armor', rarity: 'common', slot: 'helmet', perks: [], basePower: 8 },
  { id: 'h_gaunt_c', name: 'Fieldweave Grips', kind: 'armor', rarity: 'common', slot: 'gauntlets', perks: [], basePower: 8 },
  { id: 'h_chest_c', name: 'Fieldweave Vest', kind: 'armor', rarity: 'common', slot: 'chest', perks: [], basePower: 8 },
  { id: 'h_legs_c', name: 'Fieldweave Strides', kind: 'armor', rarity: 'common', slot: 'legs', perks: [], basePower: 8 },
  { id: 'h_class_c', name: 'Fieldweave Mark', kind: 'armor', rarity: 'common', slot: 'classItem', perks: [], basePower: 8 },
  { id: 'h_helm_u', name: 'Patrol Shell Helm', kind: 'armor', rarity: 'uncommon', slot: 'helmet', perks: P('mend'), basePower: 14 },
  { id: 'h_gaunt_u', name: 'Patrol Shell Grips', kind: 'armor', rarity: 'uncommon', slot: 'gauntlets', perks: P('stride'), basePower: 14 },
  { id: 'h_chest_u', name: 'Patrol Shell Vest', kind: 'armor', rarity: 'uncommon', slot: 'chest', perks: P('bulwark'), basePower: 14 },
  { id: 'h_legs_u', name: 'Patrol Shell Strides', kind: 'armor', rarity: 'uncommon', slot: 'legs', perks: P('stride'), basePower: 14 },
  { id: 'h_class_u', name: 'Patrol Shell Bond', kind: 'armor', rarity: 'uncommon', slot: 'classItem', perks: P('siphon'), basePower: 14 },
  { id: 'h_helm_r', name: 'Vanguard Circuit Helm', kind: 'armor', rarity: 'rare', slot: 'helmet', perks: P('lightwell'), basePower: 28 },
  { id: 'h_gaunt_r', name: 'Vanguard Circuit Grips', kind: 'armor', rarity: 'rare', slot: 'gauntlets', perks: P('cadence'), basePower: 28 },
  { id: 'h_chest_r', name: 'Vanguard Circuit Plate', kind: 'armor', rarity: 'rare', slot: 'chest', perks: P('bulwark'), basePower: 28 },
  { id: 'h_legs_r', name: 'Vanguard Circuit Greaves', kind: 'armor', rarity: 'rare', slot: 'legs', perks: P('stride'), basePower: 28 },
  { id: 'h_class_r', name: 'Vanguard Circuit Mark', kind: 'armor', rarity: 'rare', slot: 'classItem', perks: P('engrammer'), basePower: 28 },
  { id: 'h_helm_l', name: 'Auric Ward Helm', kind: 'armor', rarity: 'legendary', slot: 'helmet', perks: P('lightwell', 'mend'), basePower: 54 },
  { id: 'h_gaunt_l', name: 'Auric Ward Grips', kind: 'armor', rarity: 'legendary', slot: 'gauntlets', perks: P('cadence', 'siphon'), basePower: 54 },
  { id: 'h_chest_l', name: 'Auric Ward Plate', kind: 'armor', rarity: 'legendary', slot: 'chest', perks: P('bulwark', 'heavy'), basePower: 56 },
  { id: 'h_legs_l', name: 'Auric Ward Greaves', kind: 'armor', rarity: 'legendary', slot: 'legs', perks: P('stride', 'swift'), basePower: 54 },
  { id: 'h_class_l', name: 'Auric Ward Cloak', kind: 'armor', rarity: 'legendary', slot: 'classItem', perks: P('engrammer', 'harvest'), basePower: 55 },
  { id: 'h_helm_cr', name: 'Crucible Guard Helm', kind: 'armor', rarity: 'legendary', slot: 'helmet', perks: P('rending', 'steady'), basePower: 56 },
  { id: 'h_chest_cr', name: 'Crucible Guard Plate', kind: 'armor', rarity: 'legendary', slot: 'chest', perks: P('bulwark', 'overflow'), basePower: 57 },
  { id: 'h_helm_x', name: 'Crown of Binding', kind: 'armor', rarity: 'exotic', slot: 'helmet', perks: P('engrammer', 'lightwell'), basePower: 88 },
  { id: 'h_class_xh', name: 'Stride of the Hunt', kind: 'armor', rarity: 'exotic', slot: 'classItem', perks: P('swift', 'harvest'), basePower: 86 },
  { id: 'h_class_xt', name: 'Mantle of the Path', kind: 'armor', rarity: 'exotic', slot: 'classItem', perks: P('bulwark', 'overflow'), basePower: 86 },
  { id: 'h_class_xw', name: 'Bond of the Gate', kind: 'armor', rarity: 'exotic', slot: 'classItem', perks: P('engrammer', 'voidleech'), basePower: 86 },
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

const L = (id: string, w: number, jitter = 8): { templateId: string; weight: number; powerJitter: number } => ({
  templateId: id,
  weight: w,
  powerJitter: jitter,
});

export const ACTIVITIES: Activity[] = [
  {
    id: 'patrol_cosmo',
    name: 'Cosmodrome Patrol',
    kind: 'patrol',
    destination: 'cosmodrome',
    description: 'Old Russia. Rust, snow, and forgotten launchpads.',
    durationMs: 2500,
    powerReq: 0,
    xp: 18,
    destXp: 2,
    vendorXp: 0,
    weaponXp: 8,
    patternXp: 10,
    materials: [1, 2],
    patternIds: ['k_auto_l'],
    glimmer: [5, 10],
    loot: [
      L('k_auto_c', 18), L('k_hc_c', 14), L('k_side_c', 12), L('e_smg_c', 14), L('e_side_c', 10), L('p_gl_c', 8),
      L('h_helm_c', 10), L('h_gaunt_c', 10), L('h_chest_c', 10), L('h_legs_c', 10), L('h_class_c', 8),
      L('k_pulse_u', 6), L('k_scout_u', 5), L('e_fusion_u', 4), L('h_helm_u', 4), L('h_chest_u', 4),
      L('k_auto_r', 1.2), L('k_hc_r', 1), L('h_helm_r', 0.8),
    ],
    engramChances: { rare: 0.1, legendary: 0.03, exotic: 0.001 },
    tags: ['patrol', 'pve'],
  },
  {
    id: 'patrol_edz',
    name: 'EDZ Patrol',
    kind: 'patrol',
    destination: 'edz',
    description: 'European Dead Zone. Forests growing through old wars.',
    durationMs: 4000,
    powerReq: 0,
    destRankReq: 2,
    xp: 28,
    destXp: 3,
    vendorXp: 0,
    weaponXp: 12,
    patternXp: 12,
    materials: [1, 2],
    patternIds: ['k_pulse_l'],
    glimmer: [8, 14],
    loot: [
      L('k_pulse_u', 14), L('k_scout_u', 12), L('e_bow_u', 10), L('e_fusion_u', 10), L('p_sword_u', 8),
      L('h_helm_u', 8), L('h_gaunt_u', 8), L('h_chest_u', 8), L('h_legs_u', 8), L('h_class_u', 6),
      L('k_auto_c', 6), L('e_smg_c', 6),
      L('k_auto_r', 5), L('k_hc_r', 4), L('e_auto_r', 4), L('h_helm_r', 3), L('h_chest_r', 3),
      L('k_auto_l', 0.9), L('k_pulse_l', 0.7),
    ],
    engramChances: { rare: 0.1, legendary: 0.028, exotic: 0.001 },
    tags: ['patrol', 'pve'],
  },
  {
    id: 'patrol_nessus',
    name: 'Nessus Patrol',
    kind: 'patrol',
    destination: 'nessus',
    description: 'A converted planet. Red milk, Vex milk, same milk.',
    durationMs: 7000,
    powerReq: 0,
    destRankReq: 3,
    xp: 42,
    destXp: 4,
    vendorXp: 0,
    weaponXp: 16,
    patternXp: 14,
    materials: [1, 3],
    patternIds: ['k_hc_l'],
    glimmer: [10, 18],
    loot: [
      L('k_auto_r', 12), L('k_hc_r', 10), L('k_scout_r', 10), L('e_auto_r', 10), L('e_trace_r', 8), L('e_shot_r', 8),
      L('p_rocket_r', 6), L('p_lmg_r', 6),
      L('h_helm_r', 8), L('h_gaunt_r', 8), L('h_chest_r', 8), L('h_legs_r', 8), L('h_class_r', 6),
      L('k_auto_l', 2.2), L('k_hc_l', 1.8), L('e_shot_l', 1.6), L('h_helm_l', 1.4), L('h_chest_l', 1.2),
    ],
    engramChances: { rare: 0.12, legendary: 0.045, exotic: 0.003 },
    tags: ['patrol', 'pve'],
  },
  {
    id: 'patrol_moon',
    name: 'Moon Patrol',
    kind: 'patrol',
    destination: 'moon',
    description: 'Grey dust and older nightmares. Hive keep the hours.',
    durationMs: 12000,
    powerReq: 0,
    destRankReq: 4,
    xp: 60,
    destXp: 5,
    vendorXp: 0,
    weaponXp: 22,
    patternXp: 16,
    materials: [2, 3],
    patternIds: ['k_scout_l', 'e_shot_l'],
    glimmer: [14, 24],
    loot: [
      L('k_auto_r', 8), L('e_trace_r', 8), L('p_rocket_r', 6),
      L('k_auto_l', 8), L('k_hc_l', 7), L('k_pulse_l', 7), L('k_scout_l', 6), L('k_smg_l', 6),
      L('e_shot_l', 6), L('e_fusion_l', 5), L('e_bow_l', 5), L('e_sniper_l', 4),
      L('h_helm_l', 6), L('h_gaunt_l', 6), L('h_chest_l', 6), L('h_legs_l', 6), L('h_class_l', 5),
      L('k_hc_x', 0.12), L('h_helm_x', 0.08),
    ],
    engramChances: { rare: 0.1, legendary: 0.065, exotic: 0.006 },
    tags: ['patrol', 'pve'],
  },
  {
    id: 'patrol_europa',
    name: 'Europa Patrol',
    kind: 'patrol',
    destination: 'europa',
    description: 'Ice and Bray leftovers. The dark still listens.',
    durationMs: 18000,
    powerReq: 0,
    destRankReq: 5,
    xp: 80,
    destXp: 6,
    vendorXp: 0,
    weaponXp: 28,
    patternXp: 18,
    materials: [2, 4],
    patternIds: ['e_trace_l', 'p_lmg_l'],
    glimmer: [18, 32],
    loot: [
      L('k_auto_l', 10), L('k_hc_l', 9), L('k_pulse_l', 8), L('e_sniper_l', 7), L('e_fusion_l', 7),
      L('p_sword_l', 6), L('p_rocket_l', 6), L('p_lmg_l', 5),
      L('h_helm_l', 7), L('h_chest_l', 7), L('h_class_l', 6), L('h_helm_cr', 4),
      L('k_hc_x', 0.35), L('k_scout_x', 0.3), L('e_fusion_x', 0.25), L('h_helm_x', 0.2),
    ],
    engramChances: { rare: 0.08, legendary: 0.09, exotic: 0.012 },
    tags: ['patrol', 'pve'],
  },
  {
    id: 'strike_playlist',
    name: 'Vanguard Ops',
    kind: 'strike',
    destination: 'edz',
    vendor: 'zavala',
    description: 'Strike playlist. Three Guardians, one bad neighborhood.',
    durationMs: 22000,
    powerReq: 36,
    xp: 90,
    destXp: 4,
    vendorXp: 40,
    weaponXp: 28,
    patternXp: 16,
    materials: [1, 2],
    patternIds: ['k_pulse_l', 'e_bow_l'],
    glimmer: [16, 28],
    loot: [
      L('k_auto_r', 10), L('k_hc_r', 8), L('e_auto_r', 8), L('p_rocket_r', 6),
      L('h_helm_r', 8), L('h_chest_r', 8), L('h_class_r', 6),
      L('k_auto_l', 5), L('k_pulse_l', 4), L('e_shot_l', 4), L('h_helm_l', 4), L('h_chest_l', 4), L('h_class_l', 3),
      L('k_hc_x', 0.08),
    ],
    engramChances: { rare: 0.14, legendary: 0.05, exotic: 0.002 },
    combat: {
      waves: [
        { name: 'Fallen Dregs', hp: 40 },
        { name: 'Vandal Patrol', hp: 70 },
        { name: 'Captain', hp: 140 },
      ],
    },
    tags: ['pve', 'vanguard', 'combat'],
  },
  {
    id: 'nightfall',
    name: 'Nightfall: The Ordeal',
    kind: 'nightfall',
    destination: 'nessus',
    vendor: 'zavala',
    description: 'One strike. No mercy. Champions in the dark.',
    durationMs: 52000,
    powerReq: 145,
    xp: 180,
    destXp: 6,
    vendorXp: 80,
    weaponXp: 50,
    patternXp: 28,
    materials: [2, 4],
    patternIds: ['e_fusion_l', 'e_fusion_x'],
    glimmer: [30, 50],
    loot: [
      L('k_auto_l', 10), L('k_hc_l', 9), L('k_scout_l', 8), L('e_sniper_l', 8), L('e_fusion_l', 7),
      L('p_rocket_l', 7), L('p_sword_l', 6), L('h_helm_l', 8), L('h_chest_l', 8), L('h_class_l', 6),
      L('k_hc_x', 0.7), L('e_fusion_x', 0.5), L('p_rocket_x', 0.4), L('h_helm_x', 0.4),
    ],
    engramChances: { rare: 0.06, legendary: 0.12, exotic: 0.025 },
    combat: {
      waves: [
        { name: 'Champion Wave', hp: 220 },
        { name: 'Nightfall Boss', hp: 480 },
      ],
    },
    tags: ['pve', 'vanguard', 'combat'],
  },
  {
    id: 'ls_cosmo',
    name: 'Lost Sector: Excavation Site',
    kind: 'lostSector',
    destination: 'cosmodrome',
    description: 'A buried hangar. Ads, then a chest that almost never lies.',
    durationMs: 8000,
    powerReq: 8,
    xp: 32,
    destXp: 3,
    vendorXp: 0,
    weaponXp: 18,
    patternXp: 16,
    materials: [1, 2],
    patternIds: ['k_auto_l', 'k_smg_l'],
    glimmer: [8, 14],
    loot: [
      L('k_hc_c', 10), L('e_smg_c', 10), L('p_gl_c', 6),
      L('k_pulse_u', 12), L('e_fusion_u', 10), L('h_gaunt_u', 8), L('h_legs_u', 8),
      L('k_hc_r', 5), L('e_shot_r', 4), L('h_chest_r', 3),
      L('k_smg_l', 0.6),
    ],
    engramChances: { rare: 0.1, legendary: 0.02, exotic: 0.002 },
    combat: {
      waves: [
        { name: 'Shank Swarm', hp: 28 },
        { name: 'Lost Sector Boss', hp: 90 },
      ],
    },
    tags: ['pve', 'combat', 'lost'],
  },
  {
    id: 'ls_edz',
    name: 'Lost Sector: Widow’s Walk',
    kind: 'lostSector',
    destination: 'edz',
    description: 'A chapel of rust. The chest is louder than the choir.',
    durationMs: 11000,
    powerReq: 28,
    destRankReq: 2,
    xp: 48,
    destXp: 4,
    vendorXp: 0,
    weaponXp: 24,
    patternXp: 18,
    materials: [1, 2],
    patternIds: ['k_pulse_l', 'e_bow_l'],
    glimmer: [10, 18],
    loot: [
      L('k_scout_u', 8), L('e_bow_u', 8),
      L('k_auto_r', 10), L('e_auto_r', 9), L('e_trace_r', 7), L('h_helm_r', 7), L('h_class_r', 6),
      L('k_pulse_l', 2), L('e_bow_l', 1.6), L('h_gaunt_l', 1.4),
    ],
    engramChances: { rare: 0.12, legendary: 0.03, exotic: 0.004 },
    combat: {
      waves: [
        { name: 'Taken Thrall', hp: 50 },
        { name: 'Taken Captain', hp: 160 },
      ],
    },
    tags: ['pve', 'combat', 'lost'],
  },
  {
    id: 'ls_nessus',
    name: 'Lost Sector: The Rift',
    kind: 'lostSector',
    destination: 'nessus',
    description: 'Vex milk tunnels. Geometry with opinions.',
    durationMs: 15000,
    powerReq: 60,
    destRankReq: 3,
    xp: 70,
    destXp: 5,
    vendorXp: 0,
    weaponXp: 32,
    patternXp: 22,
    materials: [2, 3],
    patternIds: ['k_hc_l', 'e_fusion_l'],
    glimmer: [14, 22],
    loot: [
      L('k_auto_r', 8), L('p_lmg_r', 6),
      L('k_auto_l', 7), L('k_hc_l', 6), L('e_fusion_l', 6), L('e_trace_l', 5), L('h_chest_l', 5),
      L('e_fusion_x', 0.15),
    ],
    engramChances: { rare: 0.1, legendary: 0.05, exotic: 0.008 },
    combat: {
      waves: [
        { name: 'Goblin Line', hp: 80 },
        { name: 'Minotaur', hp: 220 },
      ],
    },
    tags: ['pve', 'combat', 'lost'],
  },
  {
    id: 'crucible',
    name: 'Crucible: Control',
    kind: 'crucible',
    vendor: 'shaxx',
    description: 'Lord Shaxx is already yelling. Try to deserve it.',
    durationMs: 18000,
    powerReq: 22,
    xp: 55,
    destXp: 0,
    vendorXp: 45,
    weaponXp: 36,
    patternXp: 14,
    patternIds: ['k_hc_l', 'e_sniper_l'],
    glimmer: [10, 18],
    loot: [
      L('k_hc_c', 6), L('k_hc_r', 10), L('k_scout_r', 8), L('e_shot_r', 8),
      L('k_hc_l', 3.5), L('k_pulse_l', 3), L('e_sniper_l', 2.5), L('h_helm_cr', 3), L('h_chest_cr', 3),
      L('k_hc_x', 0.1),
    ],
    engramChances: { rare: 0.08, legendary: 0.04, exotic: 0.003 },
    combat: {
      waves: [
        { name: 'Rival Fireteam', hp: 100 },
        { name: 'Zone Hold', hp: 80 },
      ],
    },
    tags: ['pvp', 'crucible', 'combat'],
  },
  {
    id: 'gambit',
    name: 'Gambit Match',
    kind: 'gambit',
    vendor: 'drifter',
    description: 'Bank motes. Invade. Pretend you trust your team.',
    durationMs: 24000,
    powerReq: 40,
    xp: 70,
    destXp: 0,
    vendorXp: 50,
    weaponXp: 32,
    patternXp: 14,
    patternIds: ['k_smg_l', 'p_gl_l'],
    glimmer: [12, 22],
    loot: [
      L('e_shot_r', 8), L('p_lmg_r', 8), L('k_auto_r', 8),
      L('k_smg_l', 4), L('e_shot_l', 4), L('p_gl_l', 3.5), L('h_gaunt_l', 3),
      L('p_sword_x', 0.08),
    ],
    engramChances: { rare: 0.09, legendary: 0.045, exotic: 0.004 },
    combat: {
      waves: [
        { name: 'Primeval Adds', hp: 90 },
        { name: 'Primeval', hp: 260 },
      ],
    },
    tags: ['gambit', 'combat'],
  },
  {
    id: 'raid_stars',
    name: 'Raid: Vault of Stars',
    kind: 'raid',
    destination: 'europa',
    description: 'A locked encounter above the ice. Bring Power, or crawl.',
    durationMs: 140000,
    powerReq: 185,
    xp: 420,
    destXp: 12,
    vendorXp: 40,
    weaponXp: 90,
    patternXp: 40,
    materials: [3, 6],
    patternIds: ['p_rocket_l', 'p_rocket_x'],
    glimmer: [50, 80],
    loot: [
      L('k_auto_l', 8), L('k_hc_l', 8), L('e_sniper_l', 8), L('p_rocket_l', 8), L('p_sword_l', 7),
      L('h_helm_l', 7), L('h_chest_l', 7), L('h_class_l', 6),
      L('k_scout_x', 1.4), L('e_bow_x', 1.2), L('p_rocket_x', 1.1), L('p_sword_x', 1.0), L('h_helm_x', 0.9),
      L('h_class_xh', 0.5), L('h_class_xt', 0.5), L('h_class_xw', 0.5),
    ],
    engramChances: { rare: 0.04, legendary: 0.18, exotic: 0.06 },
    combat: {
      waves: [
        { name: 'Encounter Adds', hp: 200 },
        { name: 'Wyvern Pair', hp: 340 },
        { name: 'Star-Eater', hp: 720 },
      ],
    },
    tags: ['raid', 'combat', 'pve'],
  },
  {
    id: 'decrypt_rare',
    name: 'Decrypt Rare Engram',
    kind: 'decrypt',
    vendor: 'cryptarch',
    description: 'Rahool reads the Light. Familiarity and materials, not a random gun.',
    durationMs: 1800,
    powerReq: 0,
    xp: 8,
    destXp: 0,
    vendorXp: 12,
    weaponXp: 0,
    glimmer: [0, 0],
    loot: [],
    engramChances: { rare: 0, legendary: 0, exotic: 0 },
    tags: ['cryptarch'],
  },
  {
    id: 'decrypt_legendary',
    name: 'Decrypt Legendary Engram',
    kind: 'decrypt',
    vendor: 'cryptarch',
    description: 'A legendary cipher. Bigger familiarity. Materials, not a lottery.',
    durationMs: 2800,
    powerReq: 0,
    xp: 16,
    destXp: 0,
    vendorXp: 22,
    weaponXp: 0,
    glimmer: [0, 0],
    loot: [],
    engramChances: { rare: 0, legendary: 0, exotic: 0 },
    tags: ['cryptarch'],
  },
  {
    id: 'decrypt_exotic',
    name: 'Decrypt Exotic Engram',
    kind: 'decrypt',
    vendor: 'cryptarch',
    description: 'Gold light. A deep tick on an unfinished exotic pattern.',
    durationMs: 4000,
    powerReq: 0,
    xp: 28,
    destXp: 0,
    vendorXp: 40,
    weaponXp: 0,
    glimmer: [0, 0],
    loot: [],
    engramChances: { rare: 0, legendary: 0, exotic: 0 },
    tags: ['cryptarch'],
  },
];

export const ACTIVITY_MAP = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

export const BOUNTY_POOL: Omit<Bounty, 'progress' | 'claimed'>[] = [
  { id: 'z1', vendorId: 'zavala', name: 'Patrol the Wilds', desc: 'Complete 4 patrols.', target: 4, kind: 'activity', match: 'patrol', rewardGlimmer: 80, rewardVendorXp: 40, rewardShards: 0 },
  { id: 'z2', vendorId: 'zavala', name: 'Strike Duty', desc: 'Complete 2 Vanguard Ops or Nightfalls.', target: 2, kind: 'activity', match: 'vanguard', rewardGlimmer: 120, rewardVendorXp: 55, rewardShards: 1 },
  { id: 'z3', vendorId: 'zavala', name: 'Lost and Found', desc: 'Clear 3 Lost Sectors.', target: 3, kind: 'activity', match: 'lost', rewardGlimmer: 90, rewardVendorXp: 40, rewardShards: 0 },
  { id: 's1', vendorId: 'shaxx', name: 'Into the Crucible', desc: 'Complete 3 Crucible matches.', target: 3, kind: 'activity', match: 'crucible', rewardGlimmer: 100, rewardVendorXp: 50, rewardShards: 1 },
  { id: 's2', vendorId: 'shaxx', name: 'Glorious Kills', desc: 'Defeat 8 rivals in the Crucible.', target: 8, kind: 'kills', match: 'crucible', rewardGlimmer: 80, rewardVendorXp: 40, rewardShards: 0 },
  { id: 's3', vendorId: 'shaxx', name: 'Weapons of Glory', desc: 'Complete 5 weapon-heavy activities.', target: 5, kind: 'activity', match: 'combat', rewardGlimmer: 70, rewardVendorXp: 30, rewardShards: 0 },
  { id: 'd1', vendorId: 'drifter', name: 'All Right, All Right', desc: 'Complete 3 Gambit matches.', target: 3, kind: 'activity', match: 'gambit', rewardGlimmer: 110, rewardVendorXp: 50, rewardShards: 1 },
  { id: 'd2', vendorId: 'drifter', name: 'Mote Grinder', desc: 'Defeat 10 Gambit combatants.', target: 10, kind: 'kills', match: 'gambit', rewardGlimmer: 80, rewardVendorXp: 35, rewardShards: 0 },
  { id: 'b1', vendorId: 'banshee', name: 'Field Test', desc: 'Complete 6 activities while armed.', target: 6, kind: 'activity', match: 'pve', rewardGlimmer: 70, rewardVendorXp: 45, rewardShards: 0 },
  { id: 'b2', vendorId: 'banshee', name: 'Parts Bin', desc: 'Dismantle 5 items.', target: 5, kind: 'dismantle', match: 'any', rewardGlimmer: 60, rewardVendorXp: 40, rewardShards: 2 },
  { id: 'c1', vendorId: 'cryptarch', name: 'Decoder Ring', desc: 'Decrypt 3 engrams.', target: 3, kind: 'decrypt', match: 'any', rewardGlimmer: 50, rewardVendorXp: 50, rewardShards: 0 },
  { id: 'c2', vendorId: 'cryptarch', name: 'Legendary Appetite', desc: 'Decrypt 2 Legendary or Exotic engrams.', target: 2, kind: 'decrypt', match: 'high', rewardGlimmer: 80, rewardVendorXp: 60, rewardShards: 1 },
];

export function startingLoadout(cls: GuardianClass): string[] {
  if (cls === 'hunter') return ['k_scout_u', 'e_smg_c', 'p_sword_u', 'h_helm_c', 'h_gaunt_c', 'h_chest_c', 'h_legs_c', 'h_class_c'];
  if (cls === 'titan') return ['k_auto_c', 'e_shot_r', 'p_gl_c', 'h_helm_c', 'h_gaunt_c', 'h_chest_u', 'h_legs_c', 'h_class_c'];
  return ['k_pulse_u', 'e_fusion_u', 'p_gl_c', 'h_helm_c', 'h_gaunt_c', 'h_chest_c', 'h_legs_c', 'h_class_c'];
}

export const SLOT_LABEL: Record<string, string> = {
  kinetic: 'Kinetic',
  energy: 'Energy',
  power: 'Power',
  helmet: 'Helmet',
  gauntlets: 'Gauntlets',
  chest: 'Chest',
  legs: 'Legs',
  classItem: 'Class Item',
};

export const ELEMENT_LABEL: Record<string, string> = {
  kinetic: 'Kinetic',
  arc: 'Arc',
  solar: 'Solar',
  void: 'Void',
  stasis: 'Stasis',
  strand: 'Strand',
};

export const GHOST_NAV: { id: string; label: string }[] = [
  { id: 'director', label: 'Director' },
  { id: 'character', label: 'Character' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'tower', label: 'Tower' },
  { id: 'settings', label: 'Settings' },
];

export interface DestMeta {
  id: string;
  label: string;
  banner: string;
  region: string;
  hue: string;
  hue2: string;
  flavor: string;
}

export const DEST_META: Record<string, DestMeta> = {
  tower: {
    id: 'tower',
    label: 'The Last City',
    banner: 'THE LAST CITY',
    region: 'TOWER',
    hue: '#d4af6a',
    hue2: '#f0d9a0',
    flavor: 'A gold pin on the dark. The courtyard still talks.',
  },
  cosmodrome: {
    id: 'cosmodrome',
    label: 'Cosmodrome',
    banner: 'COSMODROME',
    region: 'OLD RUSSIA',
    hue: '#c4b49a',
    hue2: '#8a7344',
    flavor: 'Snow on the pads. Rust still aiming at the sky.',
  },
  edz: {
    id: 'edz',
    label: 'EDZ',
    banner: 'EDZ',
    region: 'EUROPEAN DEAD ZONE',
    hue: '#3aa36a',
    hue2: '#7dcea0',
    flavor: 'Forests through the wreckage. Old wars in the roots.',
  },
  nessus: {
    id: 'nessus',
    label: 'Nessus',
    banner: 'NESSUS',
    region: 'CENTAUR',
    hue: '#c45a3a',
    hue2: '#e08a4a',
    flavor: 'A converted planet. Red milk in every cut.',
  },
  moon: {
    id: 'moon',
    label: 'Moon',
    banner: 'THE MOON',
    region: "EARTH'S SHADOW",
    hue: '#c9c6c0',
    hue2: '#8d8c87',
    flavor: 'Grey dust. Older nightmares under it.',
  },
  europa: {
    id: 'europa',
    label: 'Europa',
    banner: 'EUROPA',
    region: 'JUPITER',
    hue: '#8ec0ff',
    hue2: '#5b7fd4',
    flavor: 'Ice and Bray leftovers. The dark still listens.',
  },
};

export const PLAYLISTS: { activityId: string; label: string; sub: string }[] = [
  { activityId: 'crucible', label: 'Crucible', sub: 'Control' },
  { activityId: 'gambit', label: 'Gambit', sub: 'The table' },
  { activityId: 'strike_playlist', label: 'Vanguard Ops', sub: 'Strike playlist' },
  { activityId: 'nightfall', label: 'Nightfall', sub: 'The Ordeal' },
  { activityId: 'raid_stars', label: 'Vault of Stars', sub: 'Raid' },
];

export const WEAPON_FOUNDRY: Record<string, string> = {
  auto: 'Meridian Works. A reliable pattern, bored for long watches.',
  handCannon: 'Dust Road Arms. Heavy cylinder, honest recoil.',
  pulse: 'Vesper Threading. Three notes, one argument.',
  scout: 'Long Acre. Built to see the next hill before it sees you.',
  shotgun: 'Breach Courtesy. A door, then no door.',
  sniper: 'Oath Glass. Patience with a barrel.',
  fusion: 'Storm Ledger. Charge, hold, rewrite the room.',
  rocket: 'Skyfall Protocol. One shot that means the map.',
  sword: 'Oathsteel. A conversation at arm\\'s length.',
  bow: 'Ember Spine. Quiet until it is not.',
  smg: 'Needle Atelier. A stitch of light, then another.',
  grenadeLauncher: 'Crowd Control. For when the courtyard gets opinions.',
  lmg: 'Long Thunder. The argument that does not pause.',
  sidearm: 'Outpost Click. Last word at close range.',
  trace: 'Lattice Light. A line you can lean on.',
};

export const ARMOR_FLAVOR: Record<string, string> = {
  helmet: 'A closed circle. The Light learns the shape of your skull.',
  gauntlets: 'Hands that remember the last pull of a trigger.',
  chest: 'A wall you wear. The shot has to ask first.',
  legs: 'Miles in the weave. The map is a suggestion.',
  classItem: 'A mark that says which fire you keep.',
};

/** Per-gun foundry lines. Guns not listed keep the WEAPON_FOUNDRY type stamp. */
export const NAMED_FOUNDRY: Record<string, string> = {
  k_auto_l: 'Meridian Works. A hymn bored into old steel.',
  k_smg_l: 'Needle Atelier. Gold in the crack.',
  e_fusion_x: 'Storm Ledger. A coil around a hole.',
  k_hc_x: 'Dust Road Arms. It does not debate.',
  p_lmg_l: 'Sustained Verdict. Thunder that does not pause.',
  p_sword_l: 'Edge of Duty. An oath at arm\\'s length.',
  e_trace_l: 'Lattice Light. A river you can aim.',
  k_hc_l: 'Dust Road Arms. The oath, collected.',
  p_sword_x: 'Auric Works. Dawn with an edge.',
};

export const FINISH_MARK: Record<string, string> = {
  k_auto_l: '/art/marks/mark-iron-hymn.png',
  k_smg_l: '/art/marks/mark-gilded-fracture.png',
  e_fusion_x: '/art/marks/mark-singularity-coil.png',
  k_hc_x: '/art/marks/mark-last-argument.png',
  p_lmg_l: '/art/marks/mark-long-thunder.png',
  p_sword_l: '/art/marks/mark-oathsteel.png',
  e_trace_l: '/art/marks/mark-prism-river.png',
  k_hc_l: '/art/marks/mark-oathkeepers-due.png',
  p_sword_x: '/art/marks/mark-first-light.png',
};

export const DEST_PLATE: Record<string, string> = {
  cosmodrome: '/art/plates/plate-cosmodrome.png',
  edz: '/art/plates/plate-edz.png',
  nessus: '/art/plates/plate-nessus.png',
  moon: '/art/plates/plate-moon.png',
  europa: '/art/plates/plate-europa.png',
  tower: '/art/plates/plate-tower.png',
};

export function itemFlavor(kind: string, slot: string, weaponType?: string, templateId?: string): string {
  if (templateId && NAMED_FOUNDRY[templateId]) return NAMED_FOUNDRY[templateId];
  if (kind === 'weapon' && weaponType && WEAPON_FOUNDRY[weaponType]) return WEAPON_FOUNDRY[weaponType];
  if (ARMOR_FLAVOR[slot]) return ARMOR_FLAVOR[slot];
  return 'Field-issue. Light sits in the seams.';
}
