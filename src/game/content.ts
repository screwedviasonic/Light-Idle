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
  { id: 'zavala', name: 'Zavala', title: 'Vanguard Commander', desc: 'Strikes, Nightfalls, and the long war.', skill: 'vendor_zavala' },
  { id: 'shaxx', name: 'Shaxx', title: 'Crucible Handler', desc: 'Lord of the Crucible. Bring him glory.', skill: 'vendor_shaxx' },
  { id: 'drifter', name: 'Drifter', title: 'Gambit Host', desc: 'Motes, invaders, and bad ideas that work.', skill: 'vendor_drifter' },
  { id: 'banshee', name: 'Banshee-44', title: 'Gunsmith', desc: 'If it fires, he remembers how to make it.', skill: 'vendor_banshee' },
  { id: 'cryptarch', name: 'Rahool', title: 'Cryptarch', desc: 'Engrams in. Familiarity and materials out. Always.', skill: 'vendor_cryptarch' },
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

export const ACTIVITIES: Activity[] = [];
export const ACTIVITY_MAP = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));
export const BOUNTY_POOL: Omit<Bounty, 'progress' | 'claimed'>[] = [];
export function startingLoadout(cls: GuardianClass): string[] {
  if (cls === 'hunter') return ['k_scout_u', 'e_smg_c', 'p_sword_u', 'h_helm_c', 'h_gaunt_c', 'h_chest_c', 'h_legs_c', 'h_class_c'];
  if (cls === 'titan') return ['k_auto_c', 'e_shot_r', 'p_gl_c', 'h_helm_c', 'h_gaunt_c', 'h_chest_u', 'h_legs_c', 'h_class_c'];
  return ['k_pulse_u', 'e_fusion_u', 'p_gl_c', 'h_helm_c', 'h_gaunt_c', 'h_chest_c', 'h_legs_c', 'h_class_c'];
}
export const SLOT_LABEL: Record<string, string> = { kinetic: 'Kinetic', energy: 'Energy', power: 'Power', helmet: 'Helmet', gauntlets: 'Gauntlets', chest: 'Chest', legs: 'Legs', classItem: 'Class Item' };
export const ELEMENT_LABEL: Record<string, string> = { kinetic: 'Kinetic', arc: 'Arc', solar: 'Solar', void: 'Void', stasis: 'Stasis', strand: 'Strand' };
export const GHOST_NAV: { id: string; label: string }[] = [
  { id: 'director', label: 'Director' },
  { id: 'character', label: 'Character' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'tower', label: 'Tower' },
  { id: 'settings', label: 'Settings' },
];
export interface DestMeta { id: string; label: string; banner: string; region: string; hue: string; hue2: string; flavor: string; }
export const DEST_META: Record<string, DestMeta> = {
  tower: { id: 'tower', label: 'The Last City', banner: 'THE LAST CITY', region: 'TOWER', hue: '#d4af6a', hue2: '#f0d9a0', flavor: 'A gold pin on the dark. The courtyard still talks.' },
  cosmodrome: { id: 'cosmodrome', label: 'Cosmodrome', banner: 'COSMODROME', region: 'OLD RUSSIA', hue: '#c4b49a', hue2: '#8a7344', flavor: 'Snow on the pads. Rust still aiming at the sky.' },
  edz: { id: 'edz', label: 'EDZ', banner: 'EDZ', region: 'EUROPEAN DEAD ZONE', hue: '#3aa36a', hue2: '#7dcea0', flavor: 'Forests through the wreckage. Old wars in the roots.' },
  nessus: { id: 'nessus', label: 'Nessus', banner: 'NESSUS', region: 'CENTAUR', hue: '#c45a3a', hue2: '#e08a4a', flavor: 'A converted planet. Red milk in every cut.' },
  moon: { id: 'moon', label: 'Moon', banner: 'THE MOON', region: "EARTH'S SHADOW", hue: '#c9c6c0', hue2: '#8d8c87', flavor: 'Grey dust. Older nightmares under it.' },
  europa: { id: 'europa', label: 'Europa', banner: 'EUROPA', region: 'JUPITER', hue: '#8ec0ff', hue2: '#5b7fd4', flavor: 'Ice and Bray leftovers. The dark still listens.' },
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
  sword: "Oathsteel. A conversation at arm's length.",
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
export const NAMED_FOUNDRY: Record<string, string> = {
  k_auto_l: 'Meridian Works. A hymn bored into old steel.',
  k_smg_l: 'Needle Atelier. Gold in the crack.',
  e_fusion_x: 'Storm Ledger. A coil around a hole.',
  k_hc_x: 'Dust Road Arms. It does not debate.',
  p_lmg_l: 'Sustained Verdict. Thunder that does not pause.',
  p_sword_l: "Edge of Duty. An oath at arm's length.",
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
