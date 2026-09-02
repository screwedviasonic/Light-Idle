# Light Idle

Unofficial fan prototype of an idle / incremental game: **what Melvor Idle is to RuneScape, this is to Destiny 2**.

**Not affiliated with Bungie, Inc.** No Destiny logos, screenshots, 3D models, or ripped assets. Item names and UI art are original. Systems vocabulary (Guardian, Light, Glimmer, Engrams, Vanguard, Crucible, Gambit, Arc/Solar/Void, Hunter/Titan/Warlock, Power) is used descriptively.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm install
npm run build
```

Fully client-side. Progress saves to `localStorage`. Close the tab and come back — elapsed time is granted on load, capped at **8 hours** (configurable in Settings).

## How to play

1. Create a Guardian (name + Hunter / Titan / Warlock).
2. You land in the Tower with a white loadout and one Rare Engram.
3. Start **Cosmodrome Patrol** (or EDZ once Power allows). Watch the bar, take loot, equip upgrades.
4. Decrypt engrams at the **Cryptarch**. Visit vendors for bounties and rank-up packages.
5. Climb Power to unlock Nessus, the Moon, Europa, Nightfall, and the **Vault of Stars** raid encounter.

One idle action at a time. Completions grant XP, Glimmer, reputation, and loot.

### Class idle bonuses

| Class   | Bonus                                      |
|---------|--------------------------------------------|
| Hunter  | Faster patrols and Lost Sectors            |
| Titan   | More Glimmer and stronger armor drops      |
| Warlock | More XP and better engram luck             |

## Melvor to Destiny mapping

| Melvor Idle        | Light Idle                                      |
|--------------------|-------------------------------------------------|
| Skills (Woodcutting, Mining, ...) | Destination ranks + weapon-type mastery |
| Combat skill       | Power level, weapon DPS, Super meter            |
| Mastery            | Weapon mastery (Auto, Hand Cannon, Pulse, ...)  |
| Thieving / dungeons| Patrols, Lost Sectors, Strikes, Nightfall, Raid |
| Shop / GP          | Glimmer, Legendary Shards                       |
| Farming / bank     | Inventory + Vault                               |
| Alt Magic          | Cryptarch decrypt (idle or instant for Glimmer) |
| Township / slayer  | Vendor ranks (Zavala, Shaxx, Drifter, Banshee)  |

## Stack

Vite + React + TypeScript. No backend.
