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
