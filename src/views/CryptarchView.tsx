import { RARITY_COLOR } from '../game/content';
import { useStore } from '../state/store';

const TIERS: { rarity: 'rare' | 'legendary' | 'exotic'; cost: number; label: string }[] = [
  { rarity: 'rare', cost: 20, label: 'Rare Engram' },
  { rarity: 'legendary', cost: 80, label: 'Legendary Engram' },
  { rarity: 'exotic', cost: 250, label: 'Exotic Engram' },
];

export function CryptarchView() {
  const { game, dispatch } = useStore();
  if (!game) return null;
  const vs = game.vendors.cryptarch;

  return (
    <div>
      <div className="tiny">Cryptarch</div>
      <h3>Rahool</h3>
      <p className="tiny">Decrypt always yields familiarity and destination materials. Never a random legendary.</p>
      {vs && vs.packagesReady > 0 && (
        <button
          type="button"
          className="btn ghost claim-pkg"
          onClick={() => dispatch({ type: 'claimPackage', vendorId: 'cryptarch' })}
        >
          Claim rank-up{vs.packagesReady > 1 ? ` x${vs.packagesReady}` : ''}
        </button>
      )}
      <div className="meta-row" style={{ marginTop: 10 }}>
        {TIERS.map((t) => (
          <div key={t.rarity} className="meta">
            <div className="k" style={{ color: RARITY_COLOR[t.rarity] }}>
              {t.label}
            </div>
            <div className="v">{game.engrams[t.rarity]}</div>
          </div>
        ))}
      </div>
      <div className="list" style={{ marginTop: 12 }}>
        {TIERS.map((t) => {
          const have = game.engrams[t.rarity];
          return (
            <div key={t.rarity} className="vendor-card">
              <h3 className={t.rarity} style={{ color: RARITY_COLOR[t.rarity] }}>
                {t.label}
              </h3>
              <p className="tiny">
                Owned {have} · Instant {t.cost} Glimmer
                {t.rarity === 'rare' && ' · Small familiarity tick'}
                {t.rarity === 'legendary' && ' · Bigger familiarity · tiny exotic garnish'}
                {t.rarity === 'exotic' && ' · Deep tick on an unfinished exotic'}
              </p>
              <div className="row-btns" style={{ marginTop: 8 }}>
                <button
                  className="btn primary"
                  disabled={have < 1 || game.currencies.glimmer < t.cost}
                  onClick={() => {
                    dispatch({ type: 'decryptWatch', on: true });
                    dispatch({ type: 'decryptNow', rarity: t.rarity });
                  }}
                >
                  Instant
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
