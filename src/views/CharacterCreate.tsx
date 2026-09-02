import { useState } from 'react';
import { CLASS_META } from '../game/content';
import { useStore } from '../state/store';
import type { GuardianClass } from '../types';

export function CharacterCreate() {
  const { dispatch } = useStore();
  const [name, setName] = useState('Sparrow');
  const [cls, setCls] = useState<GuardianClass>('hunter');
  return (
    <div className="create">
      <div className="panel create-card">
        <h1>Light Idle</h1>
        <p className="lead">A Guardian wakes. Choose a name and a class. The Tower is waiting.</p>
        <label htmlFor="gname">Guardian name</label>
        <input
          id="gname"
          type="text"
          maxLength={18}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label>Class</label>
        <div className="class-grid">
          {(Object.keys(CLASS_META) as GuardianClass[]).map((id) => {
            const m = CLASS_META[id];
            return (
              <button
                key={id}
                className={`class-pick ${cls === id ? 'on' : ''}`}
                style={{ ['--accent' as string]: m.accent }}
                onClick={() => setCls(id)}
              >
                <h3 style={{ color: m.accent }}>{m.label}</h3>
                <p>{m.blurb}</p>
                <div className="bonus">{m.idle}</div>
              </button>
            );
          })}
        </div>
        <button
          className="btn primary"
          disabled={!name.trim()}
          onClick={() => dispatch({ type: 'create', name: name.trim(), classId: cls })}
        >
          Descend to the Tower
        </button>
        <p className="fan-note">
          Unofficial fan prototype. Not affiliated with Bungie. No Destiny trademarks, logos, or ripped
          assets — original names, original art.
        </p>
      </div>
    </div>
  );
}
