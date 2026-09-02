export type GuardianClass = 'hunter' | 'titan' | 'warlock';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'exotic';
export type WeaponSlot = 'kinetic' | 'energy' | 'power';
export type ArmorSlot = 'helmet' | 'gauntlets' | 'chest' | 'legs' | 'classItem';
export type EquipSlot = WeaponSlot | ArmorSlot;
export type ItemKind = 'weapon' | 'armor';
export type WeaponType =
  | 'auto'
  | 'handCannon'
  | 'pulse'
  | 'scout'
  | 'shotgun'
  | 'sniper'
  | 'fusion'
  | 'rocket'
  | 'sword'
  | 'bow'
  | 'smg'
  | 'grenadeLauncher'
  | 'lmg'
  | 'sidearm'
  | 'trace';
export type Element = 'kinetic' | 'arc' | 'solar' | 'void' | 'stasis' | 'strand';
export type ActivityKind =
  | 'patrol'
  | 'strike'
  | 'nightfall'
  | 'lostSector'
  | 'crucible'
  | 'gambit'
  | 'raid'
  | 'decrypt';
export type NavId = 'director' | 'character' | 'inventory' | 'tower' | 'settings';

export interface Perk {
  id: string;
  name: string;
  desc: string;
}

export interface Item {
  id: string;
  templateId: string;
  name: string;
  kind: ItemKind;
  rarity: Rarity;
  power: number;
  slot: EquipSlot;
  weaponType?: WeaponType;
  element?: Element;
  perks: Perk[];
  mobility?: number;
  resilience?: number;
  recovery?: number;
}

export interface ItemTemplate {
  id: string;
  name: string;
  kind: ItemKind;
  rarity: Rarity;
  slot: EquipSlot;
  weaponType?: WeaponType;
  element?: Element;
  perks: Perk[];
  basePower: number;
}

export interface LootEntry {
  templateId: string;
  weight: number;
  powerJitter: number;
}

export interface EnemyDef {
  name: string;
  hp: number;
}

export interface Activity {
  id: string;
  name: string;
  kind: ActivityKind;
  destination?: string;
  vendor?: string;
  description: string;
  durationMs: number;
  powerReq: number;
  destRankReq?: number;
  xp: number;
  destXp: number;
  vendorXp: number;
  weaponXp: number;
  glimmer: [number, number];
  loot: LootEntry[];
  engramChances: { rare: number; legendary: number; exotic: number };
  materials?: [number, number];
  patternIds?: string[];
  patternXp?: number;
  combat?: { waves: EnemyDef[] };
  tags: string[];
}

export interface PatternDef {
  templateId: string;
  destination: string;
  xpToReady: number;
  finishCost: { dest: string; mats: number; glimmer: number };
}

export interface PatternState {
  xp: number;
  finished: boolean;
}

export interface EnemyState {
  name: string;
  hp: number;
  maxHp: number;
}

export interface CombatState {
  waves: EnemyState[][];
  waveIndex: number;
  enemyIndex: number;
  superMeter: number;
  superActiveMs: number;
  dps: number;
}

export interface ActiveAction {
  activityId: string;
  cycleStartedAt: number;
  durationMs: number;
  combat: CombatState | null;
  lastTickAt?: number;
}

export interface OfflineReport {
  ms: number;
  cycles: number;
  activityName: string;
  glimmer: number;
  destXp: Record<string, number>;
  materials: Record<string, number>;
  patternTicks: { name: string; xp: number; ready: boolean }[];
}

export interface SkillState {
  xp: number;
}

export interface Bounty {
  id: string;
  vendorId: string;
  name: string;
  desc: string;
  target: number;
  progress: number;
  claimed: boolean;
  kind: 'activity' | 'decrypt' | 'dismantle' | 'kills';
  match: string;
  rewardGlimmer: number;
  rewardVendorXp: number;
  rewardShards: number;
}

export interface VendorState {
  xp: number;
  bounties: Bounty[];
  packagesReady: number;
}

export interface LogEntry {
  id: string;
  t: number;
  text: string;
  rarity?: Rarity;
  kind: 'loot' | 'info' | 'combat' | 'system';
  itemId?: string;
}

export interface Currencies {
  glimmer: number;
  legendaryShards: number;
}

export interface Engrams {
  rare: number;
  legendary: number;
  exotic: number;
}

export interface Equipped {
  kinetic: string | null;
  energy: string | null;
  power: string | null;
  helmet: string | null;
  gauntlets: string | null;
  chest: string | null;
  legs: string | null;
  classItem: string | null;
}

export interface Settings {
  muted: boolean;
  offlineCapHours: number;
}

export interface Stats {
  activitiesCompleted: number;
  itemsDismantled: number;
  enemiesDefeated: number;
  engramsDecrypted: number;
  legendaryDrops: number;
  exoticDrops: number;
}

export interface Guardian {
  name: string;
  class: GuardianClass;
  createdAt: number;
}

export interface GameState {
  version: number;
  guardian: Guardian | null;
  currencies: Currencies;
  engrams: Engrams;
  skills: Record<string, SkillState>;
  vendors: Record<string, VendorState>;
  inventory: Item[];
  vault: Item[];
  postmaster: Item[];
  equipped: Equipped;
  activeAction: ActiveAction | null;
  log: LogEntry[];
  settings: Settings;
  lastSavedAt: number;
  lastTickAt?: number;
  stats: Stats;
  cryptarchBusyUntil: number;
  patterns: Record<string, PatternState>;
  materials: Record<string, number>;
  gunsmithParts: number;
  calibrations: Record<string, number>;
}

export type FilterRarity = Rarity | 'all';
export type FilterKind = ItemKind | 'all';
