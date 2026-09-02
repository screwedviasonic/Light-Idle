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
