import { useEffect, useRef } from 'react';
import { DecryptCeremony } from './components/DecryptCeremony';
import { GhostReport } from './components/GhostReport';
import { ItemInspect } from './components/ItemInspect';
import { EmblemBar, GhostNav } from './components/Layout';
import { LootToasts } from './components/LootToasts';
import { TitleCard } from './components/TitleCard';
import { ACTIVITY_MAP } from './game/content';
import { useStore } from './state/store';
import { stageKey } from './ui/format';
import { ActivityHud } from './views/ActivityHud';
import { CharacterCreate } from './views/CharacterCreate';
import { CharacterView } from './views/CharacterView';
import { DirectorView } from './views/DirectorView';
import { InventoryView } from './views/InventoryView';
import { SettingsView } from './views/SettingsView';
import { TowerView } from './views/TowerView';

export default function App() {
  const { game, ui } = useStore();
  const cls = game?.guardian?.class;
  useDropChime(game);

  if (!game?.guardian) {
    return (
      <>
        <div className="star-bg" />
        <CharacterCreate />
      </>
    );
  }

  const act = game.activeAction ? ACTIVITY_MAP[game.activeAction.activityId] : undefined;
  const stage = act ? stageKey(act) : 'orbit';

  return (
    <div className={`app ${cls ? `cls-${cls}` : ''} stage-${stage}`}>
      <div className="star-bg" />
      <div className="stage-wash" />
      <EmblemBar />
      <GhostNav />
      {ui.tabLocked && (
        <div className="tab-lock-banner" role="status">
          This save is open in another tab.
        </div>
      )}
      <main className="stage">
        {ui.hudOpen && game.activeAction ? (
          <ActivityHud />
        ) : ui.nav === 'director' ? (
          <DirectorView />
        ) : ui.nav === 'character' ? (
          <CharacterView />
        ) : ui.nav === 'inventory' ? (
          <InventoryView />
        ) : ui.nav === 'tower' ? (
          <TowerView />
        ) : (
          <SettingsView />
        )}
      </main>
      <LootToasts />
      <ItemInspect />
      <DecryptCeremony />
      <GhostReport />
      <TitleCard />
    </div>
  );
}

function useDropChime(game: ReturnType<typeof useStore>['game']) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!game || game.settings.muted) return;
    const top = game.log[0];
    if (!top || top.id === last.current) return;
    last.current = top.id;
    if (top.rarity !== 'legendary' && top.rarity !== 'exotic') return;
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = top.rarity === 'exotic' ? 880 : 520;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.12);
      window.setTimeout(() => void ctx.close(), 300);
    } catch {
      // ignore
    }
  }, [game]);
}
