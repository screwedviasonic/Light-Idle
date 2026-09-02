import { DEST_META, MATERIAL_LABEL } from '../game/content';
import { formatDuration } from '../game/engine';
import { useStore } from '../state/store';

export function GhostReport() {
  const { ui, dispatch } = useStore();
  const r = ui.offlineReport;
  if (!r || r.cycles <= 0) return null;
  const destLines = Object.entries(r.destXp).filter(([, n]) => n > 0);
  const matLines = Object.entries(r.materials).filter(([, n]) => n > 0);
  return (
    <div
      className="inspect-veil ghost-report"
      onClick={() => dispatch({ type: 'offlineReport', report: null })}
    >
      <div className="inspect-card" onClick={(e) => e.stopPropagation()}>
        <div className="tiny">Ghost report</div>
        <h2 className="char-name" style={{ margin: '4px 0 8px' }}>
          While you were away
        </h2>
        <p className="tiny">
          {formatDuration(r.ms)} · {r.cycles} cycle{r.cycles === 1 ? '' : 's'} of {r.activityName || 'the field'}
        </p>
        <div className="ghost-report-grid">
          <div className="meta">
            <div className="k">Glimmer</div>
            <div className="v gold">+{Math.floor(r.glimmer).toLocaleString()}</div>
          </div>
          {destLines.map(([id, n]) => (
            <div className="meta" key={`xp-${id}`}>
              <div className="k">{DEST_META[id]?.label ?? id} XP</div>
              <div className="v">+{n}</div>
            </div>
          ))}
          {matLines.map(([id, n]) => (
            <div className="meta" key={`mat-${id}`}>
              <div className="k">{MATERIAL_LABEL[id] ?? id}</div>
              <div className="v">+{n}</div>
            </div>
          ))}
        </div>
        {r.patternTicks.length > 0 && (
          <>
            <div className="section-title">Patterns</div>
            {r.patternTicks.map((p) => (
              <div key={p.name} className="tiny" style={{ marginBottom: 4 }}>
                {p.name} · +{p.xp} familiarity{p.ready ? ' · ready at Banshee' : ''}
              </div>
            ))}
          </>
        )}
        <div className="row-btns" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn primary"
            onClick={() => dispatch({ type: 'offlineReport', report: null })}
          >
            Claim
          </button>
        </div>
      </div>
    </div>
  );
}
