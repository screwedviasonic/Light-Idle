import { useEffect, useState } from 'react';
import { ArtPanel } from '../components/ArtPanel';
import {
  ACTIVITY_MAP,
  DEST_META,
  MATERIAL_LABEL,
  PATTERN_MAP,
  SLOT_LABEL,
  TEMPLATE_MAP,
  XP_PER_LEVEL,
} from '../game/content';
import {
  activityFeedOverflow,
  activityFeedPatterns,
  currentEnemy,
  destLevel,
  formatCountdown,
  formatEta,
  formatRate,
  getItem,
  patternEtaMs,
  patternCanFinish,
  patternFinishLock,
  patternIsReady,
  patternPct,
  xpIntoLevel,
} from '../game/engine';
import { useStore } from '../state/store';
import { activityNameplate, slotChaseCopy } from '../ui/format';

export function ActivityHud() {
  const { game, dispatch, power } = useStore();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);
  if (!game?.activeAction) return null;
  const act = ACTIVITY_MAP[game.activeAction.activityId];
  if (!act) return null;
  const np = activityNameplate(act);
  const action = game.activeAction;
  const rates = formatRate(act, game);
  const loadout = (['kinetic', 'energy', 'power'] as const).map((s) => ({
    slot: s,
    item: getItem(game, game.equipped[s]),
  }));

  const dur = action.durationMs;
  const elapsed = Math.max(0, now - action.cycleStartedAt);
  const cycleElapsed = dur > 0 ? elapsed % dur : elapsed;
  const pct = action.combat
    ? combatPct(action.combat)
    : dur > 0
      ? Math.min(100, (cycleElapsed / dur) * 100)
      : 0;
  const remain = action.combat ? null : Math.max(0, dur - cycleElapsed);
  const enemy = currentEnemy(action.combat);
  const superPct = action.combat ? Math.min(100, action.combat.superMeter * 100) : 0;
  const dest = act.destination;
  const destRank = dest ? destLevel(game, dest) : 0;
  const destInto = dest ? xpIntoLevel(game.skills[`dest_${dest}`]?.xp ?? 0) : 0;
  const matLabel = dest ? MATERIAL_LABEL[dest] : null;
  const matCount = dest ? (game.materials[dest] ?? 0) : 0;
  const feeds = activityFeedPatterns(game, act);
  const overflow = activityFeedOverflow(game, act);
  const destLabel = act.destination ? (DEST_META[act.destination]?.label ?? act.destination) : 'Node';
  const feedId = feeds[0];
  const feedDest = feedId ? PATTERN_MAP[feedId]?.destination : undefined;
  const overflowNote =
    overflow && feedId
      ? act.destination && feedDest === act.destination
        ? `${destLabel} is mapped · feeding ${TEMPLATE_MAP[feedId]?.name ?? feedId}`
        : `${destLabel} is mapped · overflow`
      : null;

  return (
    <div className="hud">
      <ArtPanel activity={act} running fill />
      <div className="hud-plate">
        <div className="hud-banner">{np.title}</div>
        <div className="hud-sub">{np.sub}</div>
      </div>
      <div className="hud-objective">
        {enemy ? (
          <>
            <div className="hud-obj-name">{enemy.name}</div>
            <div className="bar hp hud-bar">
              <i style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }} />
            </div>
          </>
        ) : (
          <div className="hud-obj-name">{act.description}</div>
        )}
        {(dest || feeds.length > 0) && (
          <div className="hud-feeds">
            {dest && (
            <div className="pattern-bar">
              <div className="pattern-bar-h">
                <span>Rank {destRank}</span>
                <span>{matLabel} {matCount}</span>
              </div>
              <div className="bar xp thin">
                <i style={{ width: `${(destInto / XP_PER_LEVEL) * 100}%` }} />
              </div>
            </div>
            )}
            {overflowNote && <div className="hud-feed-note">{overflowNote}</div>}
            {feeds.map((id) => {
              const ready = patternIsReady(game, id);
              const canFinish = patternCanFinish(game, id);
              const lock = ready ? patternFinishLock(game, id) : [];
              const name = TEMPLATE_MAP[id]?.name ?? id;
              const eta = patternEtaMs(game, act, id);
              const label = canFinish
                ? 'Ready'
                : lock.length
                  ? lock.join(' · ')
                  : `${Math.round(patternPct(game, id))}%${eta > 0 ? ` · ${formatEta(eta)}` : ''}`;
              const body = (
                <>
                  <div className="pattern-bar-h">
                    <span>{name}</span>
                    <span>{label}</span>
                  </div>
                  <div className={`bar thin ${canFinish ? 'super' : 'xp'}`}>
                    <i style={{ width: `${patternPct(game, id)}%` }} />
                  </div>
                  {canFinish && <div className="pattern-go">Finish at Banshee</div>}
                </>
              );
              if (canFinish) {
                return (
                  <button
                    type="button"
                    key={id}
                    className="pattern-bar ready pattern-bar-cta"
                    onClick={() => dispatch({ type: 'vendorStand', id: 'banshee' })}
                  >
                    {body}
                  </button>
                );
              }
              return (
                <div key={id} className="pattern-bar">
                  {body}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="hud-progress" title={`${rates.xp.toLocaleString()} XP/h · ${rates.glimmer.toLocaleString()} Glimmer/h`}>
        <div className="bar hud-bar thin">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="hud-progress-meta">
          <span>{remain !== null ? formatCountdown(remain) : action.combat?.superActiveMs ? 'SUPER' : 'Engaged'}</span>
          <span className="ghost-rate">{rates.xp.toLocaleString()} /h</span>
        </div>
      </div>
      <div className="hud-bottom">
        <div className="super-wrap">
          <div className="tiny">Super</div>
          <div className="bar super hud-bar">
            <i style={{ width: `${action.combat ? superPct : 0}%` }} />
          </div>
        </div>
        <div className="loadout-strip">
          {loadout.map((w) => {
            const chase = slotChaseCopy(game, w.slot, w.item);
            return (
            <button
              key={w.slot}
              className={`loadout-chip ${w.item ? `rarity-${w.item.rarity}` : 'empty'}`}
              onClick={() => w.item && dispatch({ type: 'inspect', id: w.item.id })}
            >
              <span className="k">{SLOT_LABEL[w.slot]}</span>
              <span className="nm">{w.item ? w.item.name : '—'}</span>
              <span className="pw">{chase ?? (w.item ? w.item.power : '')}</span>
            </button>
            );
          })}
          {(act.kind === 'nightfall' || act.kind === 'raid') && (
          <div className="loadout-power rec-power">
            <span className="k">Rec Power</span>
            <span className="n">{power}</span>
          </div>
          )}
        </div>
        <div className="hud-actions">
          <button
            className="btn ghost"
            onClick={() => dispatch({ type: 'nav', nav: 'director' })}
          >
            Return to Orbit
          </button>
          <button className="btn danger" onClick={() => dispatch({ type: 'stop' })}>
            Abandon
          </button>
        </div>
      </div>
    </div>
  );
}

function combatPct(combat: { waves: { hp: number; maxHp: number }[][]; waveIndex: number; enemyIndex: number }): number {
  let total = 0;
  let left = 0;
  combat.waves.forEach((w, wi) => {
    w.forEach((e, ei) => {
      total += e.maxHp;
      if (wi > combat.waveIndex || (wi === combat.waveIndex && ei > combat.enemyIndex)) left += e.maxHp;
      else if (wi === combat.waveIndex && ei === combat.enemyIndex) left += Math.max(0, e.hp);
    });
  });
  if (total <= 0) return 100;
  return Math.min(100, ((total - left) / total) * 100);
}
