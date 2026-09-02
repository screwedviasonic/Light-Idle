import type { Activity } from '../types';
import { DEST_PLATE } from '../game/content';

function sceneFor(act: Activity): string {
  if (act.kind === 'crucible') return 'crucible';
  if (act.kind === 'gambit') return 'gambit';
  if (act.kind === 'raid') return 'raid';
  if (act.kind === 'nightfall') return 'nightfall';
  if (act.kind === 'decrypt') return 'crypt';
  return act.destination ?? 'tower';
}

export function DestHero({ destId, fill }: { destId: string; fill?: boolean }) {
  const src = DEST_PLATE[destId];
  if (!src) return <SceneArt scene={destId} fill={fill} />;
  return (
    <div className={`art ${fill ? 'art-fill' : ''} art-${destId} art-plate`}>
      <img src={src} alt="" />
    </div>
  );
}

export function ArtPanel({
  activity,
  running,
  fill,
}: {
  activity: Activity;
  running: boolean;
  fill?: boolean;
}) {
  return <SceneArt scene={sceneFor(activity)} running={running} fill={fill} />;
}

export function SceneArt({
  scene,
  running,
  fill,
}: {
  scene: string;
  running?: boolean;
  fill?: boolean;
}) {
  return (
    <div className={`art ${fill ? 'art-fill' : ''} art-${scene}`}>
      <svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice">
        <SceneBody scene={scene} />
        {running && (
          <g opacity="0.7">
            <polygon points="400,28 410,46 390,46" fill="#f0d9a0">
              <animate attributeName="opacity" values="0.15;1;0.15" dur="1.6s" repeatCount="indefinite" />
            </polygon>
          </g>
        )}
      </svg>
    </div>
  );
}

function SceneBody({ scene }: { scene: string }) {
  switch (scene) {
    case 'cosmodrome':
      return <Cosmodrome />;
    case 'edz':
      return <Edz />;
    case 'nessus':
      return <Nessus />;
    case 'moon':
      return <Moon />;
    case 'europa':
      return <Europa />;
    case 'tower':
      return <Tower />;
    case 'crucible':
      return <Crucible />;
    case 'gambit':
      return <Gambit />;
    case 'raid':
      return <Raid />;
    case 'nightfall':
      return <Nightfall />;
    case 'crypt':
      return <Crypt />;
    default:
      return <Tower />;
  }
}

function Cosmodrome() {
  return (
    <g>
      <rect width="800" height="360" fill="#14110e" />
      <rect width="800" height="220" fill="#2a261f" />
      <circle cx="640" cy="70" r="34" fill="#d8cbb4" opacity="0.35" />
      <rect x="0" y="220" width="800" height="140" fill="#1c1814" />
      <polygon points="70,220 120,70 150,220" fill="#3a3228" stroke="#c4b49a" strokeWidth="1.2" />
      <rect x="118" y="40" width="5" height="180" fill="#d4af6a" opacity="0.75" />
      <rect x="230" y="150" width="110" height="80" fill="none" stroke="#c4b49a" strokeWidth="1.4" />
      <rect x="250" y="168" width="24" height="24" fill="none" stroke="#8a7344" />
      <path d="M390 250 L540 160 L700 250" fill="none" stroke="#8a7344" strokeWidth="2" />
      <rect x="560" y="188" width="70" height="50" fill="none" stroke="#c4b49a" opacity="0.6" />
      <line x1="0" y1="258" x2="800" y2="250" stroke="#5c5348" />
    </g>
  );
}

function Edz() {
  return (
    <g>
      <rect width="800" height="360" fill="#0c140f" />
      <rect width="800" height="200" fill="#15241a" />
      <path d="M0 230 C90 170, 160 250, 250 200 S420 150, 540 220 S700 170, 800 210 L800 360 L0 360 Z" fill="#1a2e20" />
      <path d="M0 230 C90 170, 160 250, 250 200 S420 150, 540 220 S700 170, 800 210" fill="none" stroke="#3aa36a" strokeWidth="1.6" />
      <polygon points="300,230 350,90 400,230" fill="none" stroke="#8a7344" />
      <rect x="520" y="160" width="80" height="70" fill="none" stroke="#7dcea0" opacity="0.7" />
      <path d="M120 240 L120 170 L160 170" fill="none" stroke="#5ad68a" opacity="0.55" />
    </g>
  );
}

function Nessus() {
  return (
    <g>
      <rect width="800" height="360" fill="#1a0e0a" />
      <rect width="800" height="200" fill="#2a1610" />
      <circle cx="620" cy="100" r="70" fill="#c45a3a" opacity="0.18" />
      <circle cx="620" cy="100" r="52" fill="none" stroke="#c45a3a" strokeWidth="2" />
      <circle cx="620" cy="100" r="30" fill="none" stroke="#e08a4a" opacity="0.7" />
      <ellipse cx="620" cy="100" rx="96" ry="16" fill="none" stroke="#d4af6a" />
      <path d="M40 300 L200 120 L230 300" fill="none" stroke="#c45a3a" strokeWidth="1.6" />
      <polygon points="280,300 330,140 380,300 330,250" fill="none" stroke="#f0d9a0" />
      <line x1="0" y1="300" x2="800" y2="280" stroke="#5a2a1c" />
    </g>
  );
}

function Moon() {
  return (
    <g>
      <rect width="800" height="360" fill="#0c0d10" />
      <circle cx="660" cy="70" r="48" fill="#c9c6c0" opacity="0.12" />
      <circle cx="660" cy="70" r="40" fill="none" stroke="#c9c6c0" />
      <circle cx="678" cy="58" r="10" fill="none" stroke="#8d8c87" />
      <polygon points="100,320 200,110 300,320" fill="#1a1b1e" stroke="#c9a0ff" strokeWidth="1.2" opacity="0.9" />
      <polygon points="240,320 320,160 400,320" fill="none" stroke="#8a7344" />
      <ellipse cx="520" cy="280" rx="80" ry="18" fill="none" stroke="#8d8c87" />
      <line x1="0" y1="318" x2="800" y2="310" stroke="#5c5b58" />
    </g>
  );
}

function Europa() {
  return (
    <g>
      <rect width="800" height="360" fill="#0a1220" />
      <rect width="800" height="180" fill="#122038" />
      <polygon points="60,320 140,40 210,320" fill="#1a3058" stroke="#8ec0ff" strokeWidth="1.4" />
      <polygon points="180,320 270,90 340,320" fill="none" stroke="#d4af6a" opacity="0.7" />
      <polygon points="500,320 640,50 780,320" fill="#152848" stroke="#5b7fd4" strokeWidth="1.5" />
      <line x1="0" y1="318" x2="800" y2="318" stroke="#eceae4" opacity="0.35" />
      <path d="M0 240 L180 210 L360 250 L540 200 L800 230" fill="none" stroke="#8ec0ff" opacity="0.4" />
      <circle cx="400" cy="40" r="4" fill="#f0d9a0" />
    </g>
  );
}

function Tower() {
  return (
    <g>
      <rect width="800" height="360" fill="#0c0e16" />
      <rect x="0" y="250" width="800" height="110" fill="#16141c" />
      <rect x="340" y="50" width="22" height="210" fill="none" stroke="#d4af6a" strokeWidth="1.6" />
      <polygon points="328,50 351,16 374,50" fill="none" stroke="#f0d9a0" />
      <rect x="250" y="140" width="36" height="120" fill="none" stroke="#c9c6c0" opacity="0.55" />
      <rect x="500" y="110" width="28" height="150" fill="none" stroke="#c9c6c0" opacity="0.5" />
      <circle cx="351" cy="110" r="12" fill="none" stroke="#d4af6a" />
      <path d="M0 268 L800 268" stroke="#8a7344" />
    </g>
  );
}

function Crucible() {
  return (
    <g>
      <rect width="800" height="360" fill="#140a0a" />
      <ellipse cx="400" cy="250" rx="240" ry="50" fill="none" stroke="#c45a3a" strokeWidth="2" />
      <polygon points="400,50 440,120 360,120" fill="none" stroke="#d4af6a" />
      <path d="M150 250 L400 90 L650 250" fill="none" stroke="#e05a4f" opacity="0.65" />
    </g>
  );
}

function Gambit() {
  return (
    <g>
      <rect width="800" height="360" fill="#0a140f" />
      <circle cx="400" cy="170" r="48" fill="none" stroke="#5ad68a" strokeWidth="2" />
      <circle cx="400" cy="170" r="10" fill="#5ad68a" opacity="0.75" />
      <circle cx="280" cy="220" r="14" fill="none" stroke="#d4af6a" />
      <circle cx="520" cy="220" r="14" fill="none" stroke="#d4af6a" />
      <path d="M100 300 Q400 60 700 300" fill="none" stroke="#3aa36a" opacity="0.5" />
    </g>
  );
}

function Raid() {
  return (
    <g>
      <rect width="800" height="360" fill="#0a0c14" />
      <polygon points="400,24 590,330 210,330" fill="none" stroke="#d4af6a" strokeWidth="1.8" />
      <polygon points="400,80 520,310 280,310" fill="none" stroke="#c9a0ff" />
      <circle cx="400" cy="190" r="22" fill="none" stroke="#f0d9a0" />
      <circle cx="400" cy="190" r="4" fill="#e8c547" />
    </g>
  );
}

function Nightfall() {
  return (
    <g>
      <rect width="800" height="360" fill="#07060c" />
      <polygon points="400,30 650,330 150,330" fill="none" stroke="#4aa3ff" opacity="0.75" />
      <circle cx="660" cy="50" r="12" fill="#eceae4" opacity="0.45" />
      <path d="M80 330 L220 90 L270 330" fill="none" stroke="#8a7344" />
    </g>
  );
}

function Crypt() {
  return (
    <g>
      <rect width="800" height="360" fill="#0a1018" />
      <polygon points="400,40 490,170 400,300 310,170" fill="none" stroke="#4aa3ff" strokeWidth="2.2" />
      <polygon points="400,80 450,170 400,260 350,170" fill="none" stroke="#d4af6a" />
      <circle cx="400" cy="170" r="8" fill="#e8c547" />
    </g>
  );
}
