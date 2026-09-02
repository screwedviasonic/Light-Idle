import { useState } from 'react';
import { DestHero } from '../components/ArtPanel';
import { ACTIVITY_MAP, DEST_META, MATERIAL_LABEL, PLAYLISTS, XP_PER_LEVEL } from '../game/content';
import {
  activityDuration,
  activityLockedReason,
  destLevel,
  formatDuration,
  xpIntoLevel,
} from '../game/engine';
import { useStore } from '../state/store';
import {
  activityNameplate,
  bestLootLabel,
  destActivities,
} from '../ui/format';
import type { Activity } from '../types';

const DEST_NODES: { destId: string; x: number; y: number }[] = [
  { destId: 'tower', x: 17, y: 64 },
  { destId: 'cosmodrome', x: 30, y: 44 },
  { destId: 'edz', x: 41, y: 66 },
  { destId: 'moon', x: 49, y: 34 },
  { destId: 'nessus', x: 65, y: 54 },
  { destId: 'europa', x: 83, y: 38 },
];

const PLAY_NODES: { activityId: string; x: number; y: number }[] = [
  { activityId: 'crucible', x: 36, y: 15 },
  { activityId: 'gambit', x: 50, y: 10 },
  { activityId: 'strike_playlist', x: 64, y: 14 },
  { activityId: 'nightfall', x: 76, y: 24 },
  { activityId: 'raid_stars', x: 88, y: 15 },
];

const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: (i * 137.5) % 1000,
  y: (i * 89.3) % 620,
  r: i % 5 === 0 ? 1.3 : 0.55,
  o: 0.22 + (i % 7) * 0.08,
}));

export function DirectorView() {
  const { ui } = useStore();
  if (ui.destId && ui.destId !== 'tower') return <DestinationMap destId={ui.destId} />;
  return <SolarMap />;
}

function SolarMap() {
  const { game, ui, dispatch } = useStore();
  const [hover, setHover] = useState<string | null>(null);
  if (!game) return null;
  const idleId = game.activeAction?.activityId;
  const idleAct = idleId ? ACTIVITY_MAP[idleId] : undefined;

  return (
    <div className="director">
      <svg className="director-sky" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice">
        <rect width="1000" height="620" fill="#07080c" />
        <radialGradient id="sun" cx="32%" cy="58%" r="50%">
          <stop offset="0%" stopColor="#1a2238" />
          <stop offset="100%" stopColor="#07080c" />
        </radialGradient>
        <rect width="1000" height="620" fill="url(#sun)" />
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#eceae4" opacity={s.o} />
        ))}
        <ellipse cx="360" cy="350" rx="210" ry="118" fill="none" stroke="rgba(212,175,106,0.14)" />
        <ellipse cx="480" cy="330" rx="340" ry="168" fill="none" stroke="rgba(212,175,106,0.1)" />
        <ellipse cx="540" cy="310" rx="460" ry="210" fill="none" stroke="rgba(140,160,220,0.1)" />
        <ellipse cx="520" cy="120" rx="390" ry="86" fill="none" stroke="rgba(212,175,106,0.16)" />
        {DEST_NODES.map((n) => {
          const m = DEST_META[n.destId];
          return (
            <g key={n.destId} transform={`translate(${n.x * 10} ${n.y * 6.2})`}>
              <PlanetMark destId={n.destId} hue={m.hue} hue2={m.hue2} />
            </g>
          );
        })}
      </svg>

      {DEST_NODES.map((n) => {
        const m = DEST_META[n.destId];
        const acts = n.destId === 'tower' ? [] : destActivities(n.destId);
        const lock =
          n.destId === 'tower'
            ? null
            : acts.map((a) => activityLockedReason(game, a)).find(Boolean) &&
              acts.every((a) => activityLockedReason(game, a))
              ? activityLockedReason(game, acts[0])
              : null;
        const idling =
          idleAct &&
          ((n.destId === 'tower' && idleAct.kind === 'decrypt') ||
            (idleAct.destination === n.destId && (idleAct.kind === 'patrol' || idleAct.kind === 'lostSector')));
        const tipAct = acts[0];
        return (
          <button
            key={n.destId}
            className={`dir-node dest-${n.destId} ${lock ? 'locked' : ''} ${idling ? 'idle' : ''} ${hover === n.destId ? 'hot' : ''}`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            onMouseEnter={() => setHover(n.destId)}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
              if (n.destId === 'tower') dispatch({ type: 'nav', nav: 'tower' });
              else dispatch({ type: 'openDest', destId: n.destId });
            }}
          >
            <span className="dir-node-name">{m.label}</span>
            {hover === n.destId && (
              <span className="dir-tip">
                <b>{m.label}</b>
                <span>{m.region}</span>
                {n.destId !== 'tower' && (
                  <span>Rank {destLevel(game, n.destId)} · {MATERIAL_LABEL[n.destId] ?? 'Mats'} {game.materials[n.destId] ?? 0}</span>
                )}
                {tipAct && <span>{bestLootLabel(tipAct)}</span>}
                {lock && <span className="lock">{lock}</span>}
              </span>
            )}
          </button>
        );
      })}

      {PLAY_NODES.map((n) => {
        const act = ACTIVITY_MAP[n.activityId];
        const pl = PLAYLISTS.find((p) => p.activityId === n.activityId);
        if (!act || !pl) return null;
        const lock = activityLockedReason(game, act);
        const idling = idleId === act.id;
        return (
          <button
            key={n.activityId}
            className={`dir-node play ${lock ? 'locked' : ''} ${idling ? 'idle' : ''}`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            onMouseEnter={() => setHover(n.activityId)}
            onMouseLeave={() => setHover(null)}
            onClick={() => dispatch({ type: 'openLaunch', id: act.id })}
          >
            <PlaylistIcon id={n.activityId} />
            <span className="dir-node-name">{pl.label}</span>
            {hover === n.activityId && (
              <span className="dir-tip">
                <b>{pl.label}</b>
                <span>{pl.sub}</span>
                {(act.kind === 'nightfall' || act.kind === 'raid') && <span>Rec. Power {act.powerReq}</span>}
                <span>{bestLootLabel(act)}</span>
                {lock && <span className="lock">{lock}</span>}
              </span>
            )}
          </button>
        );
      })}

      {ui.launchId && ACTIVITY_MAP[ui.launchId] && (
        <LaunchCard act={ACTIVITY_MAP[ui.launchId]} />
      )}
    </div>
  );
}

function DestinationMap({ destId }: { destId: string }) {
  const { game, ui, dispatch } = useStore();
  const [hover, setHover] = useState<string | null>(null);
  if (!game) return null;
  const meta = DEST_META[destId];
  const acts = destActivities(destId);
  const idleId = game.activeAction?.activityId;

  return (
    <div className={`dest-map dest-${destId}`}>
      <DestHero destId={destId} fill />
      <div className="dest-plate">
        <div className="dest-banner">{meta.banner}</div>
        <div className="dest-region">{meta.region}</div>
        <p className="dest-flavor">{meta.flavor}</p>
        <div className="dest-rankline">
          <span>Rank {destLevel(game, destId)}</span>
          <div className="bar xp thin" style={{ width: 140 }}>
            <i style={{ width: `${(xpIntoLevel(game.skills[`dest_${destId}`]?.xp ?? 0) / XP_PER_LEVEL) * 100}%` }} />
          </div>
          <span>{MATERIAL_LABEL[destId] ?? 'Mats'} {game.materials[destId] ?? 0}</span>
        </div>
      </div>
      <button className="btn ghost dest-back" onClick={() => dispatch({ type: 'openDest', destId: null })}>
        Return to Director
      </button>
      {acts.map((a, i) => {
        const lock = activityLockedReason(game, a);
        const left = 28 + (i % 2) * 32;
        const top = 46 + Math.floor(i / 2) * 18;
        return (
          <button
            key={a.id}
            className={`dir-node dest-act ${lock ? 'locked' : ''} ${idleId === a.id ? 'idle' : ''}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            onMouseEnter={() => setHover(a.id)}
            onMouseLeave={() => setHover(null)}
            onClick={() => dispatch({ type: 'openLaunch', id: a.id })}
          >
            <span className="dir-node-name">{a.kind === 'patrol' ? 'Patrol' : 'Lost Sector'}</span>
            {hover === a.id && (
              <span className="dir-tip">
                <b>{a.name}</b>
                <span>{bestLootLabel(a)}</span>
                {lock && <span className="lock">{lock}</span>}
              </span>
            )}
          </button>
        );
      })}
      {ui.launchId && ACTIVITY_MAP[ui.launchId] && <LaunchCard act={ACTIVITY_MAP[ui.launchId]} />}
    </div>
  );
}

function LaunchCard({ act }: { act: Activity }) {
  const { game, dispatch } = useStore();
  if (!game) return null;
  const lock = activityLockedReason(game, act);
  const np = activityNameplate(act);
  return (
    <div className="launch-card">
      <div className="launch-kicker">{np.title}</div>
      <h3>{act.name}</h3>
      <p>{act.description}</p>
      <div className="launch-meta">
        <span>{formatDuration(activityDuration(game, act))}</span>
        {(act.kind === 'nightfall' || act.kind === 'raid') && <span>Rec. Power {act.powerReq}</span>}
        <span>{bestLootLabel(act)}</span>
      </div>
      {lock && <div className="lock">{lock}</div>}
      <div className="row-btns">
        <button
          className="btn primary"
          disabled={Boolean(lock)}
          onClick={() => {
            dispatch({ type: 'start', activityId: act.id });
            dispatch({ type: 'setHud', open: true });
            dispatch({ type: 'titleCard', title: np.title, sub: np.sub });
          }}
        >
          Launch
        </button>
        <button className="btn ghost" onClick={() => dispatch({ type: 'openLaunch', id: null })}>
          Back
        </button>
      </div>
    </div>
  );
}

function PlanetMark({ destId, hue, hue2 }: { destId: string; hue: string; hue2: string }) {
  if (destId === 'tower') {
    return (
      <g>
        <circle r="18" fill="#d4af6a" opacity="0.16" />
        <rect x="-3" y="-16" width="6" height="22" fill="none" stroke={hue} />
        <polygon points="-8,-16 0,-26 8,-16" fill="none" stroke={hue2} />
      </g>
    );
  }
  if (destId === 'nessus') {
    return (
      <g>
        <circle r="18" fill={hue} opacity="0.25" />
        <circle r="14" fill="none" stroke={hue} strokeWidth="2" />
        <ellipse rx="26" ry="5" fill="none" stroke={hue2} transform="rotate(-24)" />
      </g>
    );
  }
  if (destId === 'europa') {
    return (
      <g>
        <circle r="16" fill={hue} opacity="0.2" />
        <circle r="14" fill="none" stroke={hue} strokeWidth="1.6" />
        <path d="M-10 -4 L4 8 M-4 -12 L8 2" stroke={hue2} />
      </g>
    );
  }
  if (destId === 'moon') {
    return (
      <g>
        <circle r="12" fill={hue} opacity="0.18" />
        <circle r="11" fill="none" stroke={hue} />
        <circle cx="4" cy="-3" r="3" fill="none" stroke={hue2} />
      </g>
    );
  }
  if (destId === 'edz') {
    return (
      <g>
        <circle r="16" fill={hue} opacity="0.22" />
        <circle r="14" fill="none" stroke={hue} strokeWidth="1.6" />
        <path d="M-10 4 Q0 -8 10 4" fill="none" stroke={hue2} />
      </g>
    );
  }
  return (
    <g>
      <circle r="16" fill={hue} opacity="0.2" />
      <circle r="14" fill="none" stroke={hue} strokeWidth="1.6" />
      <path d="M-8 6 L0 -6 L8 6" fill="none" stroke={hue2} />
    </g>
  );
}

function PlaylistIcon({ id }: { id: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="play-ico">
      {id === 'crucible' && <polygon points="12,3 21,19 3,19" fill="none" stroke="currentColor" />}
      {id === 'gambit' && (
        <>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </>
      )}
      {id === 'strike_playlist' && <path d="M5 18 V8 L12 4 L19 8 V18" fill="none" stroke="currentColor" />}
      {id === 'nightfall' && <polygon points="12,3 21,12 12,21 3,12" fill="none" stroke="currentColor" />}
      {id === 'raid_stars' && <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="none" stroke="currentColor" />}
    </svg>
  );
}
