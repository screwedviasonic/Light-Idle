import {
  CLASS_META,
  DESTINATIONS,
  ELEMENT_LABEL,
  MATERIAL_LABEL,
  PATTERN_DEFS,
  RARITY_COLOR,
  SLOT_LABEL,
  TEMPLATE_MAP,
  XP_PER_LEVEL,
} from '../game/content';
import { armorStats, destLevel, getItem, patternCanFinish, patternFinishLock, patternIsReady, patternPct, xpIntoLevel } from '../game/engine';
import { useStore } from '../state/store';
import type { EquipSlot, GameState } from '../types';
import { ELEMENT_COLOR, slotChaseCopy } from '../ui/format';
import { EmptySocket, ItemGlyph } from '../components/ItemGlyph';
import { ClassMark } from '../components/ClassMark';

const WEAPONS: EquipSlot[] = ['kinetic', 'energy', 'power'];
const ARMOR: EquipSlot[] = ['helmet', 'gauntlets', 'chest', 'legs', 'classItem'];

export function CharacterView() {
  const { game, dispatch } = useStore();
  if (!game?.guardian) return null;
  const cls = CLASS_META[game.guardian.class];
  const stats = armorStats(game);
  const el = ELEMENT_COLOR[cls.element];
  return (
    <div className="char-screen">
      <div className="char-hero">
        <div className="char-silhouette" style={{ color: cls.accent }}>
          <ClassMark cls={game.guardian.class} size={52} />
        </div>
        <div className="char-identity">
          <div className="tiny">Guardian</div>
          <h2 className="char-name">{game.guardian.name}</h2>
          <div className="char-sub" style={{ color: cls.accent }}>
            {cls.label} · {cls.subclass}
          </div>
          <p className="char-flavor">{cls.subclassFlavor}</p>
          <div className="el-pip" style={{ color: el }}>
            <i style={{ background: el }} />
            {ELEMENT_LABEL[cls.element]}
          </div>
        </div>
      </div>
      <div className="char-fold">
      <div className="char-loadout">
      <div className="paper-doll">
        <div className="doll-col">
          {WEAPONS.map((s) => (
            <SlotTile key={s} slot={s} game={game} onInspect={(id) => dispatch({ type: 'inspect', id })} />
          ))}
        </div>
        <div className="doll-col">
          {ARMOR.map((s) => (
            <SlotTile key={s} slot={s} game={game} onInspect={(id) => dispatch({ type: 'inspect', id })} />
          ))}
        </div>
      </div>
      <div className="char-stats">
        <span>Mobility {stats.mobility}</span>
        <span>Resilience {stats.resilience}</span>
        <span>Recovery {stats.recovery}</span>
      </div>
      </div>
      <div className="rep-block">
        <div className="section-title">Destinations</div>
        {DESTINATIONS.filter((d) => d.id !== 'tower').map((d) => (
          <div key={d.id} className="tiny-bar dest-mat-bar">
            <span>
              {d.label} · Rank {destLevel(game, d.id)}
            </span>
            <div className="bar xp">
              <i style={{ width: `${(xpIntoLevel(game.skills[`dest_${d.id}`]?.xp ?? 0) / XP_PER_LEVEL) * 100}%` }} />
            </div>
            <span className="tiny">
              {MATERIAL_LABEL[d.id]} {game.materials[d.id] ?? 0}
            </span>
          </div>
        ))}
        <div className="section-title">Named guns</div>
        <p className="tiny">Familiarity is the chase. Finish them at Banshee.</p>
        {PATTERN_DEFS.filter((p) => {
          if (game.patterns[p.templateId]?.finished) return false;
          return patternIsReady(game, p.templateId) || patternPct(game, p.templateId) > 0;
        })
          .slice()
          .sort((a, b) => Number(patternIsReady(game, b.templateId)) - Number(patternIsReady(game, a.templateId)))
          .map((p) => (
            <GunProgress key={`chase-${p.templateId}`} templateId={p.templateId} game={game} onInspect={(id) => dispatch({ type: 'inspect', id })} />
          ))}
        {DESTINATIONS.filter((d) => d.id !== 'tower').map((d) => {
          const guns = PATTERN_DEFS.filter((p) => {
            if (p.destination !== d.id) return false;
            if (game.patterns[p.templateId]?.finished) return true;
            return !(patternIsReady(game, p.templateId) || patternPct(game, p.templateId) > 0);
          });
          if (!guns.length) return null;
          return (
            <div key={d.id} className="collection-group">
              <div className="tiny">{d.label}</div>
              {guns.map((p) => (
                <GunProgress key={p.templateId} templateId={p.templateId} game={game} onInspect={(id) => dispatch({ type: 'inspect', id })} />
              ))}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}


function GunProgress({
  templateId,
  game,
  onInspect,
}: {
  templateId: string;
  game: GameState;
  onInspect: (id: string) => void;
}) {
  const gun = TEMPLATE_MAP[templateId];
  const finished = game.patterns[templateId]?.finished;
  const ready = patternIsReady(game, templateId);
  const canFinish = patternCanFinish(game, templateId);
  const lock = patternFinishLock(game, templateId);
  const label = finished
    ? 'Finished'
    : canFinish
      ? 'Ready'
      : ready
        ? lock.join(' · ')
        : `${Math.round(patternPct(game, templateId))}%`;
  return (
    <button
      type="button"
      className="foundry-row collection-row"
      onClick={() => onInspect(`pattern:${templateId}`)}
    >
      <div className="foundry-name">
        <span className="nm" style={{ color: RARITY_COLOR[gun?.rarity ?? 'legendary'] }}>
          {gun?.name ?? templateId}
        </span>
        <span className="tiny">{label}</span>
      </div>
      <div className={`bar thin ${canFinish ? 'super' : 'xp'}`} style={{ width: 120 }}>
        <i style={{ width: `${patternPct(game, templateId)}%` }} />
      </div>
    </button>
  );
}

function SlotTile({
  slot,
  game,
  onInspect,
}: {
  slot: EquipSlot;
  game: GameState;
  onInspect: (id: string) => void;
}) {
  const it = getItem(game, game.equipped[slot]);
  if (!it) {
    return (
      <div className="equip-tile empty">
        <EmptySocket />
        <div className="sl">{SLOT_LABEL[slot]}</div>
      </div>
    );
  }
  const chase = slotChaseCopy(game, slot, it);
  return (
    <button className={`equip-tile rarity-${it.rarity}`} onClick={() => onInspect(it.id)}>
      <div className={`rarity-bar rarity-${it.rarity}`} />
      <ItemGlyph item={it} size={16} />
      <div className="equip-copy">
        <div className="sl">{SLOT_LABEL[slot]}</div>
        <div className={`nm ${it.rarity}`}>{it.name}</div>
      </div>
      <div className="pw">{chase ?? it.power}</div>
    </button>
  );
}
