import type { GameState } from '../types';
import { INVENTORY_CAP, POSTMASTER_CAP, SAVE_KEY, SAVE_VERSION, VAULT_CAP } from './content';
import { ensureLoopFields } from './engine';
import { clearSessionKeys } from './session';

export function normalizeSave(data: GameState): GameState {
  if (!Array.isArray(data.postmaster)) data.postmaster = [];
  if (!Array.isArray(data.inventory)) data.inventory = [];
  if (!Array.isArray(data.vault)) data.vault = [];
  if (data.inventory.length > INVENTORY_CAP) {
    const extra = data.inventory.splice(INVENTORY_CAP);
    data.vault.push(...extra);
  }
  if (data.vault.length > VAULT_CAP) {
    const extra = data.vault.splice(VAULT_CAP);
    data.postmaster.push(...extra);
  }
  if (data.postmaster.length > POSTMASTER_CAP) {
    data.postmaster.length = POSTMASTER_CAP;
  }
  const fromV1 = data.version === 1;
  if (!data.settings) data.settings = { muted: true, offlineCapHours: 24 };
  if (fromV1 && data.settings.offlineCapHours === 8) {
    data.settings.offlineCapHours = 24;
  }
  ensureLoopFields(data);
  data.version = SAVE_VERSION;
  return data;
}

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GameState;
    if (!data || typeof data !== 'object') return null;
    if (typeof data.version !== 'number') return null;
    // v3 key only — do not migrate bags-full v1/v2 junk.
    if (data.version !== SAVE_VERSION) return null;
    if (!data.guardian) return null;
    return normalizeSave(data);
  } catch {
    return null;
  }
}

export function persistSave(state: GameState): void {
  if (!state?.guardian) return;
  try {
    // Do not stamp lastSavedAt here. Live watermark is lastTickAt.
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota / private mode
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
  clearSessionKeys();
}

export function exportSave(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export function importSave(json: string): GameState | null {
  try {
    const data = JSON.parse(json) as GameState;
    if (!data || typeof data !== 'object') return null;
    if (!data.version) data.version = SAVE_VERSION;
    if (data.version < 1 || data.version > SAVE_VERSION) return null;
    return normalizeSave(data);
  } catch {
    return null;
  }
}
