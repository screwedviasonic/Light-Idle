import { useEffect } from 'react';
import {
  DEST_META,
  ELEMENT_LABEL,
  MATERIAL_LABEL,
  PATTERN_MAP,
  SLOT_LABEL,
  TEMPLATE_MAP,
  itemFlavor,
} from '../game/content';
import { getItem, patternCanFinish, patternFinishLock, patternIsReady, patternPct, resolveInspectId } from '../game/engine';
import { useStore } from '../state/store';
import { ELEMENT_COLOR, typeLine } from '../ui/format';
import { ItemGlyph } from './ItemGlyph';

export function ItemInspect() {
  const { game, ui, dispatch } = useStore();
  const inspectId = (game && ui.inspectId ? resolveInspectId(game, ui.inspectId) : null) ?? ui.inspectId;
  const item = game && inspectId && !inspectId.startsWith('pattern:') ? getItem(game, inspectId) : undefined;

  useEffect(() => {
    if (!ui.inspectId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'inspect', id: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ui.inspectId, dispatch]);

  if (!game || !ui.inspectId || ui.ceremony) return null;
  if (inspectId?.startsWith('pattern:')) {
    return <PatternInspect templateId={inspectId.slice('pattern:'.length)} />;
  }
  if (inspectId && PATTERN_MAP[inspectId] && TEMPLATE_MAP[inspectId]) {
    return <PatternInspect templateId={inspectId} />;
  }
  if (!item) {
    return (
      <div className="inspect-veil" onClick={() => dispatch({ type: 'inspect', id: null })}>
        <div className="inspect-card" onClick={(e) => e.stopPropagation()}>
          <p className="muted">That piece is gone.</p>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'inspect', id: null })}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const equipped = Object.values(game.equipped).includes(item.id);
  const inVault = game.vault.some((i) => i.id === item.id);
  const inPost = (game.postmaster ?? []).some((i) => i.id === item.id);
  const el = item.element ?? (item.kind === 'weapon' ? 'kinetic' : undefined);
  const perks = item.perks.filter((p) => p && p.name);

  return (
    <div className="inspect-veil" onClick={() => dispatch({ type: 'inspect', id: null })}>
      <div
        className={`inspect-card rarity-${item.rarity}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="inspect-x" aria-label="Close" onClick={() => dispatch({ type: 'inspect', id: null })}>
          ×
        </button>
        <div className={`inspect-rule rarity-${item.rarity}`} />
        <div className="inspect-top">
          <div>
            <div className={`inspect-name ${item.rarity}`}>{item.name}</div>
            <div className="inspect-type">{typeLine(item)}</div>
          </div>
          <div className="inspect-power">
            <div className="k">Power</div>
            <div className="n">{item.power}</div>
          </div>
        </div>
        <div className="inspect-meta">
          {el && (
            <span className="el-pip" style={{ color: ELEMENT_COLOR[el] }}>
              <i style={{ background: ELEMENT_COLOR[el] }} />
              {ELEMENT_LABEL[el]}
            </span>
          )}
          <span>{SLOT_LABEL[item.slot]}</span>
          {equipped && <span className="gold">Equipped</span>}
        </div>
        <div className="inspect-body">
          <div className="inspect-glyph-wrap">
            <ItemGlyph item={item} size={72} />
          </div>
          <div className="perk-grid">
            {perks.map((perk) => (
              <PerkSocket key={perk.id || perk.name} perk={perk} />
            ))}
          </div>
        </div>
        {item.kind === 'armor' && (
          <div className="inspect-stats">
            <span>Mobility {item.mobility ?? 0}</span>
            <span>Resilience {item.resilience ?? 0}</span>
            <span>Recovery {item.recovery ?? 0}</span>
          </div>
        )}
        <p className="inspect-flavor">{itemFlavor(item.kind, item.slot, item.weaponType, item.templateId)}</p>
        {(!equipped || inVault || inPost) && (
        <div className="row-btns inspect-actions">
          {!equipped && (
            <button type="button" className="btn primary" onClick={() => dispatch({ type: 'equip', id: item.id })}>
              Equip
            </button>
          )}
          {!inVault && !inPost && !equipped && (
            <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'vault', id: item.id })}>
              Vault
            </button>
          )}
          {inVault && (
            <button type="button" className="btn" onClick={() => dispatch({ type: 'pull', id: item.id })}>
              Pull from Vault
            </button>
          )}
          {inPost && (
            <button type="button" className="btn primary" onClick={() => dispatch({ type: 'collectPostmaster', id: item.id })}>
              Collect from Postmaster
            </button>
          )}
          {!equipped && (
            <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'dismantle', id: item.id })}>
              Dismantle
            </button>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function PerkSocket({ perk }: { perk: { name: string; desc: string } }) {
  return (
    <div className="perk-socket">
      <span className="perk-nm">{perk.name}</span>
      <span className="perk-ds">{perk.desc}</span>
    </div>
  );
}


function PatternInspect({ templateId }: { templateId: string }) {
  const { game, dispatch } = useStore();
  if (!game) return null;
  const def = PATTERN_MAP[templateId];
  const gun = TEMPLATE_MAP[templateId];
  if (!def || !gun) {
    return (
      <div className="inspect-veil" onClick={() => dispatch({ type: 'inspect', id: null })}>
        <div className="inspect-card" onClick={(e) => e.stopPropagation()}>
          <p className="muted">Unknown pattern.</p>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'inspect', id: null })}>
            Close
          </button>
        </div>
      </div>
    );
  }
  const p = game.patterns[templateId];
  const ready = patternIsReady(game, templateId);
  const canFinish = patternCanFinish(game, templateId);
  const lock = patternFinishLock(game, templateId);
  const finished = Boolean(p?.finished);
  const dest = DEST_META[def.destination];
  const perks = gun.perks.filter((p) => p && p.name);
  return (
    <div className="inspect-veil" onClick={() => dispatch({ type: 'inspect', id: null })}>
      <div className={`inspect-card rarity-${gun.rarity}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="inspect-x" aria-label="Close" onClick={() => dispatch({ type: 'inspect', id: null })}>
          ×
        </button>
        <div className={`inspect-rule rarity-${gun.rarity}`} />
        <div className="inspect-top">
          <div>
            <div className={`inspect-name ${gun.rarity}`}>{gun.name}</div>
            <div className="inspect-type">
              {finished ? 'Finished pattern' : canFinish ? 'Ready at Banshee' : ready ? lock.join(' · ') : 'Foundry pattern'}
            </div>
          </div>
        </div>
        <div className="inspect-meta">
          <span>{dest?.label ?? def.destination}</span>
          <span>
            {finished ? 'Finished' : canFinish ? 'Ready' : ready ? lock.join(' · ') : `${Math.round(patternPct(game, templateId))}%`}
          </span>
        </div>
        <div className="pattern-bar">
          <div className="bar xp">
            <i style={{ width: `${patternPct(game, templateId)}%` }} />
          </div>
        </div>
        <div className="inspect-body" style={{ marginTop: 12 }}>
          <div className="inspect-glyph-wrap" />
          <div className="perk-grid">
            {perks.map((perk) => (
              <PerkSocket key={perk.id || perk.name} perk={perk} />
            ))}
          </div>
        </div>
        <p className="inspect-flavor">{itemFlavor(gun.kind, gun.slot, gun.weaponType, templateId)}</p>
        {!finished && (
          <p className="tiny">
            Finish cost: {def.finishCost.mats} {MATERIAL_LABEL[def.finishCost.dest]} · {def.finishCost.glimmer} Glimmer
          </p>
        )}
        {canFinish && !finished && (
        <div className="row-btns inspect-actions">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                dispatch({ type: 'inspect', id: null });
                dispatch({ type: 'decryptWatch', on: true });
                dispatch({ type: 'finishPattern', templateId });
              }}
            >
              Finish at Banshee
            </button>
        </div>
        )}
        {ready && !canFinish && !finished && (
          <p className="tiny">{lock.join(' · ')}</p>
        )}
      </div>
    </div>
  );
}
