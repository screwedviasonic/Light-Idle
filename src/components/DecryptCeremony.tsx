import { useEffect, useRef, useState } from 'react';
import { FINISH_MARK, TEMPLATE_MAP } from '../game/content';
import { getItem, pickDecryptCeremonyLog, resolveInspectId } from '../game/engine';
import { useStore } from '../state/store';
import type { GameState } from '../types';

export function DecryptCeremony() {
  const { game, ui, dispatch } = useStore();
  const last = useRef<string | null>(null);
  const gameRef = useRef(game);
  gameRef.current = game;
  const [flash, setFlash] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!game) return;
    if (!ui.decryptWatch) {
      last.current = game.log[0]?.id ?? null;
      return;
    }
    if (ui.ceremony) return;
    const lastIdx = last.current ? game.log.findIndex((e) => e.id === last.current) : -1;
    const fresh = lastIdx >= 0 ? game.log.slice(0, lastIdx) : game.log.slice(0, 8);
    const e = pickDecryptCeremonyLog(fresh);
    if (!e) return;
    last.current = game.log[0]?.id ?? e.id;
    const foundry = e.text.includes('finished at the Foundry');
    const ready = e.text.includes('ready — Finish at Banshee') || e.text.includes('ready at Banshee');
    const name = foundry
      ? e.text.replace(/\s+finished at the Foundry(?: · in inventory)?\.?$/i, '')
      : ready
        ? e.text.replace(/ is ready(?: at Banshee| — Finish at Banshee)\.?$/i, '')
        : e.itemId?.startsWith('pattern:')
          ? (TEMPLATE_MAP[e.itemId.slice('pattern:'.length)]?.name ?? null)
          : null;
    dispatch({
      type: 'ceremony',
      rarity: e.rarity ?? 'legendary',
      itemId: resolveInspectId(game, e.itemId, name),
      name,
    });
  }, [game, ui.decryptWatch, ui.ceremony, dispatch]);

  useEffect(() => {
    if (!ui.ceremony) {
      setFlash(false);
      setArmed(false);
      return;
    }
    setArmed(true);
    const rare = ui.ceremony.rarity;
    const spin = rare === 'exotic' ? 1600 : rare === 'legendary' ? 1100 : 700;
    const t = window.setTimeout(() => setFlash(true), spin);
    const t2 = window.setTimeout(() => {
      const raw = ui.ceremony?.itemId ?? null;
      const name = ui.ceremony?.name;
      dispatch({ type: 'ceremony', rarity: null });
      dispatch({ type: 'decryptWatch', on: false });
      const g = gameRef.current;
      const id = g ? resolveInspectId(g, raw, name) : raw?.startsWith('pattern:') ? raw : null;
      if (id) dispatch({ type: 'inspect', id });
      setFlash(false);
      setArmed(false);
    }, spin + 420);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [ui.ceremony, dispatch]);

  if (!armed || !ui.ceremony) return null;
  const r = ui.ceremony.rarity;
  const label = ui.ceremony.name?.trim() || `${r} engram`;
  const markSrc = finishMarkSrc(game, ui.ceremony.itemId, ui.ceremony.name);
  return (
    <div className={`ceremony ceremony-${r} ${flash ? 'flash' : ''}`}>
      <div className="ceremony-well">
        {markSrc ? (
          <img className="finish-mark" src={markSrc} alt="" />
        ) : (
          <svg className="engram-glyph" viewBox="0 0 120 120" aria-hidden>
            <polygon points="60,8 112,60 60,112 8,60" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="60,28 92,60 60,92 28,60" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="60" cy="60" r="6" fill="currentColor" />
          </svg>
        )}
        <div className="ceremony-label">{label}</div>
      </div>
    </div>
  );
}

function finishMarkSrc(
  game: GameState | null,
  itemId: string | null | undefined,
  name: string | null | undefined,
): string | null {
  if (itemId?.startsWith('pattern:')) {
    const id = itemId.slice('pattern:'.length);
    return FINISH_MARK[id] ?? null;
  }
  if (game && itemId) {
    const item = getItem(game, itemId);
    if (item?.templateId && FINISH_MARK[item.templateId]) return FINISH_MARK[item.templateId];
  }
  if (name) {
    const hit = Object.values(TEMPLATE_MAP).find((t) => t.name === name);
    if (hit && FINISH_MARK[hit.id]) return FINISH_MARK[hit.id];
  }
  return null;
}
