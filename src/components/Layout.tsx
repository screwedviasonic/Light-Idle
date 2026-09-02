import { ACTIVITY_MAP, CLASS_META, DEST_META, GHOST_NAV, PATTERN_DEFS, RARITY_COLOR, TEMPLATE_MAP } from '../game/content';
import { activityFeedPatterns, destLevel, firstFinishablePattern, firstReadyPattern, patternFinishLock, patternIsReady, patternPct } from '../game/engine';
import { useStore } from '../state/store';
import type { GameState, NavId } from '../types';
import { kindLabel, stageLabel } from '../ui/format';
import { ClassMark, GhostMark } from './ClassMark';

function headerFocus(
  game: GameState,
  ready: { templateId: string; name: string } | null,
): { k: string; v: string } {
  if (ready) return { k: ready.name, v: 'Ready' };
  const act = game.activeAction ? ACTIVITY_MAP[game.activeAction.activityId] : undefined;
  const scan = (ids: string[]): { k: string; v: string } | null => {
    let best: { name: string; pct: number } | null = null;
    for (const templateId of ids) {
      if (game.patterns[templateId]?.finished) continue;
      if (patternIsReady(game, templateId)) continue;
      const pct = patternPct(game, templateId);
      const name = TEMPLATE_MAP[templateId]?.name ?? templateId;
      if (!best || pct > best.pct) best = { name, pct };
    }
    if (best && best.pct > 0) return { k: best.name, v: `${Math.round(best.pct)}%` };
    return null;
  };
  if (act) {
    const fed = scan(activityFeedPatterns(game, act));
    if (fed) return fed;
  }
  const all = scan(PATTERN_DEFS.map((d) => d.templateId));
  if (all) return all;
  const dest = act?.destination || 'cosmodrome';
  const id = dest || 'cosmodrome';
  const label = DEST_META[id]?.label ?? id;
  return { k: label, v: `Rank ${destLevel(game, id)}` };
}

export function EmblemBar() {
  const { game, ui, dispatch } = useStore();
  if (!game?.guardian) return null;
  const cls = CLASS_META[game.guardian.class];
  const act = game.activeAction ? ACTIVITY_MAP[game.activeAction.activityId] : undefined;
  const finishable = firstFinishablePattern(game);
  const xpReady = firstReadyPattern(game);
  const lock = !finishable && xpReady ? patternFinishLock(game, xpReady.templateId) : [];
  const focus = finishable
    ? { k: finishable.name, v: 'Ready' }
    : lock.length && xpReady
      ? { k: xpReady.name, v: lock.join(' · ') }
      : headerFocus(game, null);
  const destId = act?.destination || 'cosmodrome';
  return (
    <header className="emblem">
      <div className="emblem-id">
        <span className="emblem-mark" style={{ color: cls.accent }}>
          <ClassMark cls={game.guardian.class} size={34} />
        </span>
        <div>
          <div className="emblem-name">{game.guardian.name}</div>
          <div className="emblem-class" style={{ color: cls.accent }}>
            {cls.label} · {cls.subclass}
          </div>
        </div>
      </div>
      <div className="emblem-stat emblem-focus">
        <div className="k">{focus.k}</div>
        <div className="emblem-focus-row">
          <div className="v gold">{focus.v}</div>
          {finishable && (
            <button
              type="button"
              className="btn primary emblem-cta"
              onClick={() => dispatch({ type: 'vendorStand', id: 'banshee' })}
            >
              Finish at Banshee
            </button>
          )}
        </div>
      </div>
      <div className="emblem-stat">
        <div className="k">{DEST_META[destId]?.label ?? destId}</div>
        <div className="v">Rank {destLevel(game, destId)}</div>
      </div>
      <div className="emblem-stat">
        <div className="k">Glimmer</div>
        <div className="v gold">{Math.floor(game.currencies.glimmer).toLocaleString()}</div>
      </div>
      <div className="emblem-stat">
        <div className="k">Shards</div>
        <div className="v">{game.currencies.legendaryShards}</div>
      </div>
      <div className="chip" title="Engrams">
        <span className="chip-k">Engrams</span>
        <span style={{ color: RARITY_COLOR.rare }}>{game.engrams.rare}</span>
        <span aria-hidden>·</span>
        <span style={{ color: RARITY_COLOR.legendary }}>{game.engrams.legendary}</span>
        <span aria-hidden>·</span>
        <span style={{ color: RARITY_COLOR.exotic }}>{game.engrams.exotic}</span>
      </div>
      <div className="top-spacer" />
      {act && (
        <button
          className={`stage-pip ${ui.hudOpen ? 'on' : ''}`}
          onClick={() => dispatch({ type: 'setHud', open: true })}
          title="Return to the activity"
        >
          <span className="pulse-dot" />
          <span className="stage-pip-on">On {stageLabel(act)}</span>
          <span className="stage-pip-sub">{kindLabel(act.kind)}</span>
        </button>
      )}
    </header>
  );
}

export function GhostNav() {
  const { ui, dispatch } = useStore();
  const active = ui.hudOpen ? 'director' : ui.nav;
  return (
    <nav className="ghost-nav">
      <GhostMark size={16} />
      {GHOST_NAV.map((n) => (
        <button
          key={n.id}
          className={`ghost-link ${active === n.id ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'nav', nav: n.id as NavId })}
        >
          {n.label}
        </button>
      ))}
    </nav>
  );
}
