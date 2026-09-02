import { SAVE_KEY } from './content';

export const AWAY_KEY = `${SAVE_KEY}:away`;
export const LEADER_KEY = `${SAVE_KEY}:leader`;
export const LEADER_STALE_MS = 2000;

export const TAB_ID = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function storageGet(key: string): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  } catch {
    // quota / private mode
  }
}

function storageRemove(key: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Last tick watermark written on leader hide/pagehide. A raw number. */
export function readAwayWatermark(): number {
  const raw = storageGet(AWAY_KEY);
  if (raw == null || raw === '') return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function writeAwayWatermark(lastTickAt: number): void {
  if (!(lastTickAt > 0)) return;
  storageSet(AWAY_KEY, String(lastTickAt));
}

export function clearAwayWatermark(): void {
  storageRemove(AWAY_KEY);
}

export function readLeader(): { id: string; t: number } | null {
  const raw = storageGet(LEADER_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { id?: unknown; t?: unknown };
    if (!data || typeof data.id !== 'string' || typeof data.t !== 'number') return null;
    if (!data.id || !(data.t > 0)) return null;
    return { id: data.id, t: data.t };
  } catch {
    return null;
  }
}

export function writeLeaderHeartbeat(id: string = TAB_ID, t: number = Date.now()): void {
  storageSet(LEADER_KEY, JSON.stringify({ id, t }));
}

export function releaseLeader(id: string = TAB_ID): void {
  const cur = readLeader();
  if (cur && cur.id !== id) return;
  storageRemove(LEADER_KEY);
}

export function leaderIsStale(now: number = Date.now()): boolean {
  const cur = readLeader();
  if (!cur) return true;
  if (cur.id === TAB_ID) return false;
  return now - cur.t > LEADER_STALE_MS;
}

/** True if this tab is now the leader. */
export function claimLeadership(now: number = Date.now()): boolean {
  const cur = readLeader();
  if (cur && cur.id !== TAB_ID && now - cur.t <= LEADER_STALE_MS) return false;
  writeLeaderHeartbeat(TAB_ID, now);
  return true;
}

export function clearSessionKeys(): void {
  storageRemove(AWAY_KEY);
  storageRemove(LEADER_KEY);
}
