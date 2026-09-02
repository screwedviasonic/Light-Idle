import { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/store';
import type { LogEntry, Rarity } from '../types';

const MAX_TOASTS = 2;
const EXIT_MS = 280;
const TICK_MS = 2200;
const TOAST_RARITY = new Set<Rarity | 'all'>(['rare', 'legendary', 'exotic']);
const LIFE: Record<string, number> = {
  common: 2500,
  uncommon: 2800,
  rare: 3800,
  legendary: 5200,
  exotic: 6200,
};

interface Toast {
  id: string;
  log: LogEntry;
  until: number;
  leaving: boolean;
}

interface GlimmerTick {
  total: number;
  until: number;
}

function glimmerAmount(text: string): number | null {
  const m = text.match(/\+(\d[\d,]*)\s*Glimmer/i);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function isItemToast(e: LogEntry): boolean {
  if (glimmerAmount(e.text) != null && !e.itemId) return false;
  if (e.text.includes('reached rank')) return true;
  if (e.text.includes('ready at Banshee') || e.text.includes('Finish at Banshee')) return true;
  if (e.text.includes('finished at the Foundry')) return true;
  if (e.text.includes('Rank-up package')) return true;
  if (e.kind === 'loot' && (e.rarity === 'legendary' || e.rarity === 'exotic') && e.text.includes('Engram')) {
    return true;
  }
  if (e.kind === 'loot' && e.itemId && !e.itemId.startsWith('pattern:')) {
    return TOAST_RARITY.has(e.rarity ?? 'common');
  }
  return false;
}

export function LootToasts() {
  const { game, ui, dispatch } = useStore();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tick, setTick] = useState<GlimmerTick | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const booted = useRef(false);
  const hold = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!game) return;
    if (!booted.current) {
      for (const e of game.log) seen.current.add(e.id);
      booted.current = true;
      return;
    }
    const now = Date.now();
    let glimmerAdd = 0;
    const fresh: Toast[] = [];
    for (const e of game.log) {
      if (seen.current.has(e.id)) continue;
      seen.current.add(e.id);
      if (now - e.t > 4000) continue;
      const g = glimmerAmount(e.text);
      if (g != null && !e.itemId) {
        glimmerAdd += g;
        continue;
      }
      if (ui.decryptWatch || ui.ceremony) continue;
      if (!isItemToast(e)) continue;
      const life = LIFE[e.rarity ?? 'rare'] ?? 3800;
      fresh.push({ log: e, id: e.id, until: now + life, leaving: false });
    }
    if (glimmerAdd > 0) {
      setTick((prev) => ({
        total: (prev && prev.until > now ? prev.total : 0) + glimmerAdd,
        until: now + TICK_MS,
      }));
    }
    if (fresh.length) {
      setToasts((prev) => {
        const active = prev.filter((t) => !t.leaving);
        const leaving = prev.filter((t) => t.leaving);
        const merged = [...fresh, ...active];
        const keep = merged.slice(0, MAX_TOASTS);
        const overflow = merged.slice(MAX_TOASTS).map((t) => ({
          ...t,
          leaving: true,
          until: now + EXIT_MS,
        }));
        return [...keep, ...overflow, ...leaving];
      });
    }
  }, [game, ui.decryptWatch, ui.ceremony]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setToasts((prev) => {
        let changed = false;
        const next: Toast[] = [];
        for (const t of prev) {
          if (hold.current.has(t.id) && !t.leaving) {
            next.push(t);
            continue;
          }
          if (t.until > now) {
            next.push(t);
            continue;
          }
          if (!t.leaving) {
            changed = true;
            next.push({ ...t, leaving: true, until: now + EXIT_MS });
          } else {
            changed = true;
          }
        }
        return changed || next.length !== prev.length ? next : prev;
      });
      setTick((prev) => (prev && prev.until <= now ? null : prev));
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  if (toasts.length === 0 && !tick) return null;
  return (
    <div className="loot-toasts" aria-live="polite">
      {tick && (
        <div className="loot-tick" aria-hidden>
          +{tick.total.toLocaleString()} Glimmer
        </div>
      )}
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`loot-toast rarity-${t.log.rarity ?? 'common'}${t.leaving ? ' leaving' : ''}`}
          onPointerDown={(ev) => {
            ev.preventDefault();
            if (t.leaving) return;
            if (t.log.text.includes('Finish at Banshee') || t.log.text.includes('ready at Banshee')) {
              dispatch({ type: 'vendorStand', id: 'banshee' });
              return;
            }
            if (!t.log.itemId) return;
            dispatch({ type: 'inspect', id: t.log.itemId });
          }}
          onMouseEnter={() => {
            if (!t.leaving) hold.current.add(t.id);
          }}
          onMouseLeave={() => {
            hold.current.delete(t.id);
            setToasts((prev) =>
              prev.map((x) =>
                x.id === t.id && !x.leaving ? { ...x, until: Date.now() + 1600 } : x,
              ),
            );
          }}
        >
          <span className="loot-toast-k">{t.log.rarity ?? 'loot'}</span>
          <span className="loot-toast-t">{t.log.text}</span>
        </button>
      ))}
    </div>
  );
}
