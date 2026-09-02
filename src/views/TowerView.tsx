import {
  CALIBRATION_MAX,
  DEST_MAT_IDS,
  DESTINATIONS,
  DEST_META,
  MATERIAL_LABEL,
  PATTERN_DEFS,
  RARITY_COLOR,
  TEMPLATE_MAP,
  VENDORS,
  XP_PER_LEVEL,
  calibrationCost,
} from '../game/content';
import { firstReadyPattern, patternFinishLock, patternIsReady, patternPct, readyPatternIds, xpIntoLevel } from '../game/engine';
import { useStore } from '../state/store';
import { CryptarchView } from './CryptarchView';
import { DestHero } from '../components/ArtPanel';

export function TowerView() {
  const { game, ui, dispatch } = useStore();
  if (!game) return null;
  const stand = ui.vendorStand;
  return (
    <div
      className={`tower${stand ? ' talking' : ''}`}
      onClick={() => {
        if (stand) dispatch({ type: 'vendorStand', id: null });
      }}
    >
      <DestHero destId="tower" fill />
      <div className="dest-plate">
        <div className="dest-banner">{DEST_META.tower.banner}</div>
        <div className="dest-region">TOWER COURTYARD</div>
        <p className="dest-flavor">{DEST_META.tower.flavor}</p>
      </div>
      <div className="courtyard">
        {VENDORS.map((v) => (
          <button
            type="button"
            key={v.id}
            className={`vendor-stand ${stand === v.id ? 'on' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'vendorStand', id: stand === v.id ? null : v.id });
            }}
          >
            <VendorMark id={v.id} />
            <div className="vendor-stand-name">{v.name}</div>
            <div className="tiny">{v.title}</div>
          </button>
        ))}
      </div>
      {stand && (
        <div
          className={`talk-panel${ui.inspectId ? ' behind-inspect' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="talk-head">
            <span className="tiny">Tower</span>
            {!ui.inspectId && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => dispatch({ type: 'vendorStand', id: null })}
            >
              Close
            </button>
            )}
          </div>
          {stand === 'cryptarch' ? (
            <div className="talk-panel-scroll">
              <CryptarchView />
            </div>
          ) : (
            <VendorTalk vendorId={stand} />
          )}
        </div>
      )}
    </div>
  );
}

function VendorTalk({ vendorId }: { vendorId: string }) {
  const { game, dispatch } = useStore();
  if (!game) return null;
  const v = VENDORS.find((x) => x.id === vendorId);
  const vs = game.vendors[vendorId];
  if (!v) return null;
  const xp = vs?.xp ?? 0;
  const into = xpIntoLevel(xp);
  const readyIds = vendorId === 'banshee' ? readyPatternIds(game) : [];
  const hudReady = vendorId === 'banshee' ? firstReadyPattern(game) : null;
  const showReadyEmpty = vendorId === 'banshee' && readyIds.length === 0 && !hudReady;
  return (
    <div className="talk-body">
      <h3>{v.name}</h3>
      <div className="title">{v.title}</div>
      {vendorId === 'banshee' && (
        <div className="foundry foundry-ready">
          <div className="section-title">Foundry</div>
          {readyIds.length === 0 && showReadyEmpty && (
            <>
              <p className="tiny">Finish a ready pattern. Designed perks. One named gun.</p>
              <div className="tiny" style={{ marginBottom: 8 }}>
                Gunsmith Parts {game.gunsmithParts}
              </div>
              <div className="tiny">No pattern is ready yet.</div>
            </>
          )}
          {readyIds.map((id) => (
            <FoundryRow key={id} templateId={id} ready />
          ))}
        </div>
      )}
      {vs && vs.packagesReady > 0 && (
        <button
          type="button"
          className="btn ghost claim-pkg"
          onClick={() => dispatch({ type: 'claimPackage', vendorId: v.id })}
        >
          Claim rank-up{vs.packagesReady > 1 ? ` x${vs.packagesReady}` : ''}
        </button>
      )}
      <div className="talk-panel-scroll">
        {vendorId === 'banshee' && <BansheeCalibrations />}
        <p className="tiny">{v.desc}</p>
        <div className="tiny-bar">
          <span>Reputation</span>
          <div className="bar xp">
            <i style={{ width: `${(into / XP_PER_LEVEL) * 100}%` }} />
          </div>
        </div>
        {vendorId === 'banshee' && readyIds.length > 0 && (
          <div className="tiny" style={{ margin: '6px 0' }}>
            Gunsmith Parts {game.gunsmithParts}
          </div>
        )}
        {vendorId === 'banshee' && <BansheeFoundryRest />}
        <div className="section-title">Bounties</div>
        {vs?.bounties.map((b) => (
          <div key={b.id} className="bounty">
            <div className="nm">{b.name}</div>
            <div className="ds">
              {b.desc} · {b.progress}/{b.target}
            </div>
            <div className="bar xp" style={{ margin: '6px 0' }}>
              <i style={{ width: `${(b.progress / b.target) * 100}%` }} />
            </div>
            {b.claimed ? (
              <span className="tiny">Claimed</span>
            ) : b.progress >= b.target ? (
              <button
                className="btn"
                onClick={() => dispatch({ type: 'claimBounty', vendorId: v.id, bountyId: b.id })}
              >
                Claim · {b.rewardGlimmer} Glimmer
              </button>
            ) : null}
          </div>
        ))}
        <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'refreshBounties', vendorId: v.id })}>
          Reroll bounties (40 Glimmer)
        </button>
      </div>
    </div>
  );
}

function FoundryRow({ templateId, ready, finished }: { templateId: string; ready?: boolean; finished?: boolean }) {
  const { game, dispatch } = useStore();
  if (!game) return null;
  const def = PATTERN_DEFS.find((x) => x.templateId === templateId);
  const gun = TEMPLATE_MAP[templateId];
  if (!def) return null;
  const lock = patternFinishLock(game, templateId);
  const costOk = lock.length === 0;
  return (
    <div className="foundry-row">
      <button
        type="button"
        className="foundry-name"
        onClick={() => dispatch({ type: 'inspect', id: `pattern:${templateId}` })}
      >
        <span className="nm" style={{ color: RARITY_COLOR[gun?.rarity ?? 'legendary'] }}>
          {gun?.name ?? templateId}
        </span>
        <span className="tiny">
          {finished
            ? 'In the collection'
            : ready
              ? costOk
                ? `Finish · ${def.finishCost.mats} ${MATERIAL_LABEL[def.finishCost.dest]} · ${def.finishCost.glimmer} Glimmer`
                : lock.join(' · ')
              : `${Math.round(patternPct(game, templateId))}%`}
        </span>
      </button>
      <div className="bar xp thin" style={{ width: 80 }}>
        <i style={{ width: `${patternPct(game, templateId)}%` }} />
      </div>
      {ready && (
        <div>
          <button
            className="btn primary"
            disabled={!costOk}
            onClick={() => {
              dispatch({ type: 'inspect', id: null });
              dispatch({ type: 'decryptWatch', on: true });
              dispatch({ type: 'finishPattern', templateId });
            }}
          >
            {costOk ? 'Finish' : lock[0] ?? 'Finish'}
          </button>
          {!costOk && lock.length > 1 && <div className="tiny">{lock.slice(1).join(' · ')}</div>}
        </div>
      )}
    </div>
  );
}

function BansheeFoundryRest() {
  const { game } = useStore();
  if (!game) return null;
  const groups: { key: string; title: string; ids: string[] }[] = [
    { key: 'progress', title: 'In progress', ids: [] },
    { key: 'finished', title: 'Finished', ids: [] },
  ];
  for (const def of PATTERN_DEFS) {
    const p = game.patterns[def.templateId];
    if (p?.finished) groups[1].ids.push(def.templateId);
    else if (patternIsReady(game, def.templateId)) continue;
    else groups[0].ids.push(def.templateId);
  }
  return (
    <div className="foundry">
      {groups.map((g) => (
        <div key={g.key}>
          {g.ids.length > 0 && (
            <div className="tiny" style={{ marginTop: 8 }}>
              {g.title}
            </div>
          )}
          {g.ids.map((id) => (
            <FoundryRow key={id} templateId={id} finished={g.key === 'finished'} />
          ))}
        </div>
      ))}
    </div>
  );
}

function BansheeCalibrations() {
  const { game, dispatch } = useStore();
  if (!game) return null;
  return (
    <div className="foundry">
      <div className="section-title">Calibrations</div>
      <p className="tiny">Permanent idle speed on a destination. Max {CALIBRATION_MAX}.</p>
      {DEST_MAT_IDS.map((id) => {
        const lvl = game.calibrations[id] ?? 0;
        const cost = calibrationCost(lvl);
        const maxed = lvl >= CALIBRATION_MAX;
        const dest = DESTINATIONS.find((d) => d.id === id);
        const haveMats = game.materials[id] ?? 0;
        const haveGlimmer = game.currencies.glimmer;
        const shortMats = !maxed && haveMats < cost.mats;
        const shortGlimmer = !maxed && haveGlimmer < cost.glimmer;
        const can = !maxed && !shortMats && !shortGlimmer;
        const need: string[] = [];
        if (shortMats) need.push(`Need ${cost.mats} ${MATERIAL_LABEL[id]}`);
        if (shortGlimmer) need.push(`Need ${cost.glimmer} Glimmer`);
        return (
          <div key={id} className="foundry-row">
            <div className="foundry-name">
              <span className="nm">{dest?.label ?? id}</span>
              <span className="tiny">
                {lvl}/{CALIBRATION_MAX}
                {can ? ` · ${cost.mats} ${MATERIAL_LABEL[id]} · ${cost.glimmer} Glimmer` : ''}
              </span>
            </div>
            <div>
              <button
                className="btn"
                disabled={!can}
                onClick={() => dispatch({ type: 'calibrate', destId: id })}
              >
                {maxed ? 'Maxed' : 'Calibrate'}
              </button>
              {need.length > 0 && <div className="tiny">{need.join(' · ')}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VendorMark({ id }: { id: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden className="vendor-mark">
      {id === 'zavala' && <polygon points="21,4 36,38 6,38" fill="none" stroke="currentColor" />}
      {id === 'shaxx' && <path d="M8 34 V12 L21 6 L34 12 V34" fill="none" stroke="currentColor" />}
      {id === 'drifter' && (
        <>
          <circle cx="21" cy="21" r="14" fill="none" stroke="currentColor" />
          <circle cx="21" cy="21" r="4" fill="currentColor" />
        </>
      )}
      {id === 'banshee' && <rect x="8" y="10" width="26" height="22" fill="none" stroke="currentColor" />}
      {id === 'cryptarch' && <polygon points="21,6 36,21 21,36 6,21" fill="none" stroke="currentColor" />}
    </svg>
  );
}
