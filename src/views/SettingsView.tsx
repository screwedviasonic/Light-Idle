import { useState } from 'react';
import { exportSave, importSave } from '../game/save';
import { useResetSave, useStore } from '../state/store';

export function SettingsView() {
  const { game, dispatch } = useStore();
  const reset = useResetSave();
  const [json, setJson] = useState('');
  const [msg, setMsg] = useState('');
  const [resetArmed, setResetArmed] = useState(false);
  if (!game) return null;

  return (
    <div className="panel" style={{ padding: 16 }}>
      <h2 className="action-name">Settings</h2>
      <p className="action-desc">Local save only. This is unofficial fan work.</p>

      <label className="tiny">Audio ticks</label>
      <div style={{ margin: '8px 0 16px' }}>
        <button type="button" className="btn" onClick={() => dispatch({ type: 'toggleMute' })}>
          {game.settings.muted ? 'Unmute UI ticks' : 'Mute UI ticks'}
        </button>
        <p className="tiny">Visual juice is always on. Audio is optional and off by default.</p>
      </div>

      <label className="tiny">Offline cap (hours)</label>
      <div className="filters" style={{ marginTop: 8 }}>
        {[2, 4, 8, 12, 24].map((h) => (
          <button
            type="button"
            key={h}
            className={game.settings.offlineCapHours === h ? 'on' : ''}
            onClick={() => dispatch({ type: 'setCap', hours: h })}
          >
            {h}h
          </button>
        ))}
      </div>
      <p className="tiny">Away progress is simulated on load, capped so a weekend doesn’t break the curve.</p>

      <hr className="gold" />
      <div className="section-title">Save data</div>
      <div className="row-btns">
        <button
          type="button"
          className="btn"
          onClick={() => {
            const data = exportSave(game);
            setJson(data);
            void navigator.clipboard?.writeText(data);
            setMsg('Exported JSON copied when clipboard allows. Paste below to backup.');
          }}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            const s = importSave(json);
            if (!s) {
              setMsg('Could not parse save.');
              return;
            }
            dispatch({ type: 'import', state: s });
            setMsg('Save imported.');
          }}
        >
          Import JSON
        </button>
        {!resetArmed ? (
          <button type="button" className="btn danger" onClick={() => setResetArmed(true)}>
            Reset save
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                reset();
                setResetArmed(false);
              }}
            >
              Confirm reset
            </button>
            <button type="button" className="btn ghost" onClick={() => setResetArmed(false)}>
              Cancel
            </button>
          </>
        )}
      </div>
      {resetArmed && (
        <p className="tiny" style={{ color: '#f0a8a4', marginTop: 8 }}>
          Tap Confirm reset to erase this Guardian. This cannot be undone.
        </p>
      )}
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        style={{
          width: '100%',
          minHeight: 140,
          marginTop: 12,
          background: '#0c0e14',
          color: '#eceae4',
          border: '1px solid rgba(212,175,106,0.28)',
          padding: 8,
          fontFamily: 'monospace',
          fontSize: 11,
        }}
      />
      {msg && <p className="tiny">{msg}</p>}
      <p className="fan-note">
        Light Idle is not affiliated with Bungie, Inc. Destiny 2 names of systems (Guardian, Glimmer, Vanguard,
        etc.) are used descriptively. Item names and art are original.
      </p>
    </div>
  );
}
