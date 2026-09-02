import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type { GameState, GuardianClass, NavId, OfflineReport, Rarity } from '../types';
import {
  applyOffline,
  claimBounty,
  claimPackage,
  createNewSave,
  dismantleItem,
  dismantleJunk,
  equipItem,
  guardianPower,
  instantDecrypt,
  collectPostmaster,
  calibrate,
  enforceCaps,
  finishPattern,
  pullVault,
  refreshBounties,
  startAction,
  stopAction,
  tickState,
  vaultItem,
} from '../game/engine';
import { GHOST_REPORT_MIN_MS, SAVE_KEY } from '../game/content';
import { clearSave, loadSave, persistSave } from '../game/save';
import {
  TAB_ID,
  claimLeadership,
  clearAwayWatermark,
  leaderIsStale,
  readLeader,
  releaseLeader,
  writeAwayWatermark,
  writeLeaderHeartbeat,
} from '../game/session';

type Action =
  | { type: 'hydrate'; state: GameState }
  | { type: 'create'; name: string; classId: GuardianClass }
  | { type: 'tick'; now: number }
  | { type: 'start'; activityId: string }
  | { type: 'stop' }
  | { type: 'equip'; id: string }
  | { type: 'dismantle'; id: string }
  | { type: 'dismantleJunk' }
  | { type: 'vault'; id: string }
  | { type: 'pull'; id: string }
  | { type: 'collectPostmaster'; id: string }
  | { type: 'claimBounty'; vendorId: string; bountyId: string }
  | { type: 'claimPackage'; vendorId: string }
  | { type: 'decryptNow'; rarity: 'rare' | 'legendary' | 'exotic' }
  | { type: 'refreshBounties'; vendorId: string }
  | { type: 'nav'; nav: NavId }
  | { type: 'openDest'; destId: string | null }
  | { type: 'openLaunch'; id: string | null }
  | { type: 'setHud'; open: boolean }
  | { type: 'inspect'; id: string | null }
  | { type: 'titleCard'; title: string; sub: string }
  | { type: 'clearTitle' }
  | { type: 'vendorStand'; id: string | null }
  | { type: 'decryptWatch'; on: boolean }
  | { type: 'ceremony'; rarity: Rarity | null; itemId?: string | null; name?: string | null }
  | { type: 'toggleMute' }
  | { type: 'setCap'; hours: number }
  | { type: 'reset' }
  | { type: 'import'; state: GameState }
  | { type: 'toast'; text: string | null }
  | { type: 'finishPattern'; templateId: string }
  | { type: 'calibrate'; destId: string }
  | { type: 'offlineReport'; report: OfflineReport | null }
  | { type: 'tabLock'; locked: boolean };

export interface CeremonyState {
  rarity: Rarity;
  itemId: string | null;
  name?: string | null;
}

export interface UiState {
  nav: NavId;
  destId: string | null;
  launchId: string | null;
  hudOpen: boolean;
  inspectId: string | null;
  titleCard: { title: string; sub: string } | null;
  vendorStand: string | null;
  decryptWatch: boolean;
  ceremony: CeremonyState | null;
  toast: string | null;
  offlineReport: OfflineReport | null;
  tabLocked: boolean;
}

function clone<T>(x: T): T {
  return structuredClone(x);
}

interface Store {
  game: GameState | null;
  ui: UiState;
  dispatch: (a: Action) => void;
  power: number;
}

const Ctx = createContext<Store | null>(null);

const initialUi: UiState = {
  nav: 'director',
  destId: null,
  launchId: null,
  hudOpen: false,
  inspectId: null,
  titleCard: null,
  vendorStand: null,
  decryptWatch: false,
  ceremony: null,
  toast: null,
  offlineReport: null,
  tabLocked: false,
};

function applyGame(game: GameState, action: Action): GameState {
  const s = clone(game);
  enforceCaps(s);
  switch (action.type) {
    case 'tick':
      tickState(s, action.now);
      return s;
    case 'start': {
      const err = startAction(s, action.activityId);
      if (err) {
        s.log.unshift({
          id: `log_${Date.now()}`,
          t: Date.now(),
          kind: 'system',
          text: err,
        });
      }
      return s;
    }
    case 'stop':
      stopAction(s);
      return s;
    case 'equip':
      equipItem(s, action.id);
      return s;
    case 'dismantle':
      dismantleItem(s, action.id);
      return s;
    case 'dismantleJunk':
      dismantleJunk(s);
      return s;
    case 'vault':
      vaultItem(s, action.id);
      return s;
    case 'pull':
      pullVault(s, action.id);
      return s;
    case 'collectPostmaster':
      collectPostmaster(s, action.id);
      return s;
    case 'claimBounty':
      claimBounty(s, action.vendorId, action.bountyId);
      return s;
    case 'claimPackage':
      claimPackage(s, action.vendorId);
      return s;
    case 'decryptNow': {
      const err = instantDecrypt(s, action.rarity);
      if (err) {
        s.log.unshift({
          id: `log_${Date.now()}`,
          t: Date.now(),
          kind: 'system',
          text: err,
        });
      }
      return s;
    }
    case 'finishPattern': {
      const err = finishPattern(s, action.templateId);
      if (err) {
        s.log.unshift({
          id: `log_${Date.now()}`,
          t: Date.now(),
          kind: 'system',
          text: err,
        });
      }
      return s;
    }
    case 'calibrate': {
      const err = calibrate(s, action.destId);
      if (err) {
        s.log.unshift({
          id: `log_${Date.now()}`,
          t: Date.now(),
          kind: 'system',
          text: err,
        });
      }
      return s;
    }
    case 'refreshBounties':
      refreshBounties(s, action.vendorId);
      return s;
    case 'toggleMute':
      s.settings.muted = !s.settings.muted;
      return s;
    case 'setCap':
      s.settings.offlineCapHours = action.hours;
      return s;
    case 'import':
      return clone(action.state);
    default:
      return s;
  }
}

const UI_ONLY = new Set([
  'nav',
  'openDest',
  'openLaunch',
  'setHud',
  'inspect',
  'titleCard',
  'clearTitle',
  'vendorStand',
  'decryptWatch',
  'ceremony',
  'toast',
  'offlineReport',
  'tabLock',
]);

let bootCache: { game: GameState | null; report: OfflineReport | null; follower: boolean } | null = null;

function leaveWatermark(g: GameState): number {
  return g.lastTickAt || g.activeAction?.lastTickAt || g.lastSavedAt || 0;
}

function bootFromDisk(): { game: GameState | null; report: OfflineReport | null; follower: boolean } {
  if (bootCache) return bootCache;
  const saved = loadSave();
  if (!saved) {
    bootCache = { game: null, report: null, follower: false };
    return bootCache;
  }
  if (!claimLeadership()) {
    bootCache = { game: clone(saved), report: null, follower: true };
    return bootCache;
  }
  const next = clone(saved);
  const report = applyOffline(next, Date.now());
  clearAwayWatermark();
  persistSave(next);
  const show = report.cycles > 0 && report.ms >= GHOST_REPORT_MIN_MS;
  bootCache = { game: next, report: show ? report : null, follower: false };
  return bootCache;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const persistEnabled = useRef(true);
  const createdThisSession = useRef(false);

  const [game, setGame] = useReducer(
    (prev: GameState | null, action: Action): GameState | null => {
      if (action.type === 'hydrate') return action.state;
      if (action.type === 'create') {
        persistEnabled.current = true;
        createdThisSession.current = true;
        const fresh = createNewSave(action.name, action.classId);
        persistSave(fresh);
        bootCache = { game: fresh, report: null, follower: false };
        writeLeaderHeartbeat();
        return fresh;
      }
      if (action.type === 'reset') {
        persistEnabled.current = false;
        createdThisSession.current = false;
        bootCache = { game: null, report: null, follower: false };
        return null;
      }
      if (action.type === 'import') {
        persistEnabled.current = true;
        return clone(action.state);
      }
      if (UI_ONLY.has(action.type)) return prev;
      if (!prev) return prev;
      return applyGame(prev, action);
    },
    null,
    () => bootFromDisk().game,
  );

  const [ui, setUi] = useReducer(
    (prev: UiState, action: Action): UiState => {
      switch (action.type) {
        case 'nav':
          return {
            ...prev,
            nav: action.nav,
            hudOpen: false,
            launchId: null,
            destId: action.nav === 'director' ? null : prev.destId,
          };
        case 'openDest':
          return { ...prev, destId: action.destId, launchId: null, nav: 'director', hudOpen: false };
        case 'openLaunch':
          return { ...prev, launchId: action.id };
        case 'setHud':
          return { ...prev, hudOpen: action.open, launchId: null };
        case 'inspect':
          return { ...prev, inspectId: action.id };
        case 'titleCard':
          return { ...prev, titleCard: { title: action.title, sub: action.sub } };
        case 'clearTitle':
          return { ...prev, titleCard: null };
        case 'vendorStand':
          return { ...prev, vendorStand: action.id, nav: 'tower', hudOpen: false };
        case 'decryptWatch':
          return { ...prev, decryptWatch: action.on };
        case 'ceremony':
          return {
            ...prev,
            ceremony: action.rarity
              ? { rarity: action.rarity, itemId: action.itemId ?? null, name: action.name ?? null }
              : null,
            inspectId: action.rarity ? null : prev.inspectId,
            decryptWatch: action.rarity ? prev.decryptWatch : false,
          };
        case 'toast':
          return { ...prev, toast: action.text };
        case 'offlineReport':
          return { ...prev, offlineReport: action.report };
        case 'tabLock':
          return { ...prev, tabLocked: action.locked };
        case 'start':
          return { ...prev, launchId: null };
        case 'stop':
          return { ...prev, hudOpen: false };
        case 'create':
          return { ...initialUi };
        case 'reset':
          return { ...initialUi };
        case 'dismantle':
          return prev.inspectId === action.id ? { ...prev, inspectId: null } : prev;
        case 'dismantleJunk':
          return { ...prev, inspectId: null };
        default:
          return prev;
      }
    },
    initialUi,
    () => {
      const boot = bootFromDisk();
      const report = boot.report;
      const tabLocked = boot.follower;
      if (report && report.cycles > 0 && report.ms >= GHOST_REPORT_MIN_MS) {
        return { ...initialUi, offlineReport: report, tabLocked };
      }
      return { ...initialUi, tabLocked };
    },
  );

  const leaderRef = useRef(!bootFromDisk().follower);

  const dispatch = useCallback((a: Action) => {
    if (a.type === 'reset') {
      persistEnabled.current = false;
      createdThisSession.current = false;
      leaderRef.current = false;
      clearSave();
    }
    if (a.type === 'create' || a.type === 'import') {
      persistEnabled.current = true;
      leaderRef.current = true;
      writeLeaderHeartbeat();
    }
    setGame(a);
    setUi(a);
  }, []);

  const gameRef = useRef(game);
  gameRef.current = game;
  const persistRef = persistEnabled;
  const createdRef = createdThisSession;

  const hiddenRef = useRef(typeof document !== 'undefined' && document.hidden);

  const becomeLeader = useCallback(
    (fromDisk: boolean) => {
      if (!persistRef.current) return false;
      if (!claimLeadership()) return false;
      leaderRef.current = true;
      dispatch({ type: 'tabLock', locked: false });
      const g = gameRef.current;
      const disk = fromDisk ? loadSave() : null;
      const base = disk ?? g;
      if (!base?.guardian) return true;
      const next = clone(base);
      const report = applyOffline(next, Date.now());
      clearAwayWatermark();
      persistSave(next);
      writeLeaderHeartbeat();
      dispatch({ type: 'hydrate', state: next });
      if (report.cycles > 0 && report.ms >= GHOST_REPORT_MIN_MS) {
        dispatch({ type: 'offlineReport', report });
      }
      return true;
    },
    [dispatch, persistRef],
  );

  useEffect(() => {
    const onHide = () => {
      hiddenRef.current = true;
      if (!persistRef.current) return;
      if (!leaderRef.current) return;
      const cur = readLeader();
      if (cur && cur.id !== TAB_ID) {
        leaderRef.current = false;
        return;
      }
      const g = gameRef.current;
      if (g?.guardian) {
        const tick = leaveWatermark(g);
        if (tick > 0) writeAwayWatermark(tick);
        persistSave(g);
      }
      releaseLeader();
      leaderRef.current = false;
    };
    const onShow = () => {
      const wasHidden = hiddenRef.current || document.hidden;
      hiddenRef.current = false;
      if (!persistRef.current) return;
      const g = gameRef.current;
      if (!g?.guardian) return;
      if (!wasHidden && !document.hidden) return;
      if (document.hidden) return;
      if (!claimLeadership()) {
        leaderRef.current = false;
        dispatch({ type: 'tabLock', locked: true });
        return;
      }
      becomeLeader(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') onHide();
      else onShow();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onHide);
    };
  }, [dispatch, persistRef, becomeLeader]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!persistRef.current) return;
      if (hiddenRef.current || document.hidden) return;
      if (!leaderRef.current) return;
      const g = gameRef.current;
      if (!g?.guardian) return;
      persistSave(g);
    }, 2000);
    return () => window.clearInterval(id);
  }, [persistRef]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!persistRef.current) return;
      if (hiddenRef.current || (typeof document !== 'undefined' && document.hidden)) return;
      if (leaderRef.current) {
        writeLeaderHeartbeat();
        return;
      }
      if (leaderIsStale()) becomeLeader(true);
    }, 500);
    return () => window.clearInterval(id);
  }, [persistRef, becomeLeader]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SAVE_KEY) return;
      // Another tab wrote or cleared. Never clobber a guardian created this session,
      // and never hydrate a ghost onto CharacterCreate / post-reset.
      if (createdRef.current) return;
      if (!gameRef.current) return;
      if (e.newValue == null) {
        persistRef.current = false;
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [createdRef, persistRef]);

  useEffect(() => {
    if (!game?.guardian) return;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last >= 100) {
        last = t;
        if (
          leaderRef.current &&
          !hiddenRef.current &&
          !document.hidden &&
          document.visibilityState === 'visible' &&
          gameRef.current?.activeAction
        ) {
          dispatch({ type: 'tick', now: Date.now() });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [game?.guardian, dispatch]);

  const power = game ? guardianPower(game) : 0;

  const value = useMemo<Store>(
    () => ({ game, ui, dispatch, power }),
    [game, ui, dispatch, power],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore outside provider');
  return ctx;
}

export function useResetSave(): () => void {
  const { dispatch } = useStore();
  return () => {
    dispatch({ type: 'reset' });
  };
}
