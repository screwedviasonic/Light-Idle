import { useState } from 'react';
import { ItemGlyph } from '../components/ItemGlyph';
import { INVENTORY_CAP, POSTMASTER_CAP, VAULT_CAP } from '../game/content';
import { useStore } from '../state/store';
import type { Item, Rarity } from '../types';
import { typeLine } from '../ui/format';

const RARITIES: (Rarity | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'legendary', 'exotic'];

export function InventoryView() {
  const { game, dispatch } = useStore();
  const [rarity, setRarity] = useState<Rarity | 'all'>('all');
  const [kind, setKind] = useState<'all' | 'weapon' | 'armor'>('all');
  const [tab, setTab] = useState<'inventory' | 'vault' | 'postmaster'>('inventory');
  if (!game) return null;
  const bags = {
    inventory: game.inventory,
    vault: game.vault,
    postmaster: game.postmaster ?? [],
  };
  const list = bags[tab];
  const filtered = list.filter((i) => (rarity === 'all' || i.rarity === rarity) && (kind === 'all' || i.kind === kind));
  const postCount = bags.postmaster.length;

  return (
    <div className="inv-screen">
      <div className="panel-h" style={{ paddingLeft: 0 }}>
        <h2>{tab === 'inventory' ? 'Inventory' : tab === 'vault' ? 'Vault' : 'Postmaster'}</h2>
        <span>
          {game.inventory.length}/{INVENTORY_CAP} · Vault {game.vault.length}/{VAULT_CAP}
          {postCount > 0 ? ` · Postmaster ${postCount}/${POSTMASTER_CAP}` : ''}
        </span>
      </div>
      <div className="row-btns" style={{ margin: '8px 0 12px' }}>
        <button
          type="button"
          className="btn ghost"
          onClick={() => dispatch({ type: 'dismantleJunk' })}
        >
          Dismantle junk
        </button>
        <span className="tiny">Common and uncommon pieces that are not equipped, from every bag.</span>
      </div>
      {postCount > 0 && tab !== 'postmaster' && (
        <p className="postmaster-note">
          The Postmaster is holding {postCount} item{postCount === 1 ? '' : 's'} that would not fit. Collect them before the box fills.
        </p>
      )}
      <div className="filters">
        <div className="filter-group" role="group" aria-label="Bag">
          <button type="button" className={tab === 'inventory' ? 'on' : ''} onClick={() => setTab('inventory')}>
            Inventory
          </button>
          <button type="button" className={tab === 'vault' ? 'on' : ''} onClick={() => setTab('vault')}>
            Vault
          </button>
          <button type="button" className={tab === 'postmaster' ? 'on' : ''} onClick={() => setTab('postmaster')}>
            Postmaster{postCount ? ` (${postCount})` : ''}
          </button>
        </div>
        <div className="filter-group" role="group" aria-label="Rarity">
          {RARITIES.map((r) => (
            <button
              type="button"
              key={`rarity-${r}`}
              className={rarity === r ? 'on' : ''}
              onClick={() => setRarity(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="filter-group" role="group" aria-label="Kind">
          {(['all', 'weapon', 'armor'] as const).map((k) => (
            <button
              type="button"
              key={`kind-${k}`}
              className={kind === k ? 'on' : ''}
              onClick={() => setKind(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="inv-grid">
        {filtered.map((item) => (
          <ItemTile
            key={item.id}
            item={item}
            equipped={Object.values(game.equipped).includes(item.id)}
            onClick={() => dispatch({ type: 'inspect', id: item.id })}
          />
        ))}
        {filtered.length === 0 && <p className="muted">Nothing here.</p>}
      </div>
    </div>
  );
}

function ItemTile({ item, equipped, onClick }: { item: Item; equipped: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`inv-tile rarity-${item.rarity}`} onClick={onClick}>
      <div className={`rarity-bar rarity-${item.rarity}`} />
      <ItemGlyph item={item} size={26} />
      <div className="inv-copy">
        <div className={`nm ${item.rarity}`}>
          {item.name}
          {equipped ? ' · Equipped' : ''}
        </div>
        <div className="dt">{typeLine(item)}</div>
      </div>
      <div className="pw">{item.power}</div>
    </button>
  );
}
