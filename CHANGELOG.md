# Change history

## 2026.10.17

- Updated compatibility guidance for Hyperborea 4.6.0 with Foundry 13.351 and
  14.369, Token Action HUD Core 2.1.1 and Socketlib 1.1.3.
- Confirmed the exercised HUD actions and all feature-roll visibility cases
  work with the tested 4.6.0 system. No gameplay-code changes were needed.
- Documented the continuing upstream lighting issue: a light can affect other
  tokens of the same actor. This system issue is retained as a known limitation,
  not classified as a TAH failure or claimed fixed by this release.

Existing compatibility declarations remain unchanged. The focused validation
does not complete every supported-version and option combination; see
[COMPATIBILITY.md](COMPATIBILITY.md) for the exact coverage and limits.

## 2026.10.16

- Updated compatibility guidance for Hyperborea 4.5.0 with Foundry 13.351 and
  14.369, Token Action HUD Core 2.1.1 and Socketlib 1.1.3.
- Added a [compatibility record](COMPATIBILITY.md) separating tested system
  snapshots, completed checks and remaining acceptance work.
- Confirmed that the system's lighting issue remains in the tested 4.5.0
  snapshot: toggling a light can affect other tokens of the same actor.

This release updates documentation and release metadata. Gameplay code and
compatibility declarations are unchanged. The focused checks do not establish
complete compatibility across every supported version and option.

## 2026.10.01

### Fixed

- Feature rolls now start with the visibility saved on the feature, including
  private, blind, self and public rolls. Changing a feature's visibility takes
  effect on the next HUD click.
- The fix preserves the selected token's actor and leaves weapon rolls, spell
  rolls and right-click sheet opening unchanged.

### Development and documentation

- Added generated manual-installation staging from the release allowlist, with
  commands to refresh and validate it. Local checks and packaging refresh it.
- Updated installation instructions to include Socketlib, clarified charged
  items on characters and NPCs, and documented the hyp3e 4.3.1 lighting issue.
- Reconciled the design, handoffs and release checklist with the shared workspace
  and October 1 validation evidence.

Compatibility declarations remain unchanged. Focused tests cover hyp3e 4.3.1
with Foundry 13.351 and 14.368. The known upstream lighting issue remains;
complete support-matrix acceptance is still a separate follow-up.

## 2026.07.28 — Published

- Added the Hyperborea companion for Token Action HUD Core 2.1, including weapon
  actions, saving throws, character checks and tasks, rollable features, spells,
  light sources and charged-item spells.
- Added NPC morale and GM-only loyalty, light actions for item tokens, and
  right-click item-sheet opening.
- Excluded passive features, ordinary Gear and Statuses from the HUD.
- Added deterministic release packaging, public-asset verification and optional
  Foundry registration. Stabilized release hashing and line endings.

Published release:
[v2026.07.28](https://github.com/DT357/token-action-hud-hyp3e/releases/tag/v2026.07.28).
