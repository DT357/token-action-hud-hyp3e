# Compatibility record

Reviewed October 16, 2026 for module **2026.10.16**. Installation and gameplay
instructions belong in [README.md](README.md); this document records engineering
evidence and its limits. Publication steps are in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## Declared requirements

| Component | Declaration | Interpretation |
| --- | --- | --- |
| Foundry | Minimum 13; verified 14.365; no explicit maximum | Core imposes an effective minimum of 13.351. The tested system supports generations 13 and 14. |
| hyp3e | Minimum 3.8.0 | Historical support floor, not the current reference or a claim of fresh minimum-version acceptance. |
| Token Action HUD Core | Manifest minimum 2.1.0; runtime API requirement 2.1 | The integration accepts Core 2.1.x. |
| Socketlib | Required by Core | Focused checks used 1.1.3. |

These declarations are retained from 2026.10.01. In particular, the historical
`verified: "14.365"` value has not been renewed by the focused runs below.
No broader compatibility declaration is introduced by this documentation release.

## Tested system identity

The October 16 validation used official hyp3e **4.5.0** at
[`5501f26d3db795eb27c114af9df644aa8628ea30`](https://github.com/thurianknight/hyp3e/commit/5501f26d3db795eb27c114af9df644aa8628ea30).
It was obtained by immutable commit into isolated test storage. The shared
read-only reference remains at `3439d5f971e36e8537bbf604b35aee27811dcd2d`;
neither the reference nor the active local system was changed for this release.

During release preparation, official `dev` had advanced to
[`9316c0e505d95626d319123cdc07807455e2f094`](https://github.com/thurianknight/hyp3e/commit/9316c0e505d95626d319123cdc07807455e2f094).
That later commit changes token helpers and adds assets. It has not received
the runtime checks recorded here. A shared version number does not make two
system commits interchangeable as compatibility evidence.

## Completed focused coverage

The initial October 16 checks used the published 2026.10.01 ZIP (14,951 bytes;
SHA-256 `DC41F3FD298057FB2362C4A76F6B7AD2A1C4EEB8DB0A89739E41420E1C04BB03`).
The exact 2026.10.16 candidate repeated the local and focused runtime gates:
all 50 local tests and 48 visibility rolls passed, and 24 regression check groups
completed with the same two lighting failures. Its ZIP is 15,084 bytes, SHA-256
`191E552CE0315EC52C232E2F87B19A27990375AB9C01C7142E7DE50E18488118`.
Runtime scripts and English localization match the October 1 release exactly.
The new candidate's final runs had no page or console errors, and all owned
test-server ports closed. This remains focused coverage, not full sign-off.

| Foundry | Node | hyp3e | Core / Socketlib | Completed focused coverage |
| --- | --- | --- | --- | --- |
| 13.351 | 22.23.2 | 4.5.0 at `5501f26` | 2.1.1 / 1.1.3 | 12 regression check groups; 24 feature-visibility rolls; lighting assertion fails |
| 14.369 | 24.15.0 | 4.5.0 at `5501f26` | 2.1.1 / 1.1.3 | 12 regression check groups; 24 feature-visibility rolls; lighting assertion fails |

Playwright 1.63.0 drove disposable worlds. Coverage includes registration and
startup, actor-specific groups, saves and representative checks, native weapon
dialog opening, spell memorization and item-spell charge consumption, synthetic
Actor identity, NPC morale/GM loyalty, Monster pruning, item-token scope,
merchant/treasure omission, owner visibility and physical right-click sheets.
The weapon probe opens and cancels the native dialog; it does not resolve a
targeted attack.

All 48 visibility rolls passed across GM/owner clients, linked characters,
synthetic characters and synthetic NPCs, using public, GM, blind and self modes.
Checks cover the saved dialog mode, recipients, blind flag, author and selected
token speaker. All six delegated Actor methods retain their expected signatures;
all 57 scanned literal localization keys resolve. These static checks do not
cover every dynamically generated string or action variant.

The local release gate passed 50 tests, syntax checks, deterministic packaging
and generated staging validation. Final completed runtime runs had no uncaught
page errors. System-owned DialogV1 deprecations and software-rendering warnings
remain recorded. Failed early harness/bootstrap attempts remain in the evidence.

## Known upstream finding

On both Foundry generations, selecting one linked token and toggling its HUD
light can also light other linked and unlinked tokens sharing its Actor ID.
The selected-token assertion fails, and each regression result remains
`ok: false`; it is not waived or reported as an overall passing suite.

The companion delegates to the selected Actor's public `toggleLightSource`
method. The tested system's `createActiveEffect` handling in
[`module/helpers/effects.mjs`](https://github.com/thurianknight/hyp3e/blob/5501f26d3db795eb27c114af9df644aa8628ea30/module/helpers/effects.mjs#L443)
matches Canvas tokens by `token.actor.id`. The finding was also reproduced with
hyp3e 4.3.1. Resolve the intended Actor/token lighting semantics upstream;
this documentation release adds no companion workaround.

## Remaining acceptance

Full compatibility sign-off is withheld. Remaining work includes targeted
attacks, ammunition/range/equipment enforcement, fuel, exhaustive feature/effect
variants, charged-item cancellation, layout persistence, themes, keyboard and
viewport behavior, and the oldest declared dependency combinations. Branch/PR
CI checks remain open. Publication succeeded in
[workflow 38917157146](https://github.com/DT357/token-action-hud-hyp3e/actions/runs/38917157146),
and Foundry registration returned `status: success`. The public manifest and ZIP
match the tested candidate. Installation through Foundry's public manifest URL
was also checked on both tested builds, including installed bytes, module
activation with Core/Socketlib and reload. No gameplay feature is newly required
by this documentation update.

Workspace-only evidence is under `RuntimeTests/token-action-hud-hyp3e/`:
`latest-2026-10-16/assessment.txt` records the original October 16 validation;
`release-2026.10.16/` records the new candidate. These paths describe local
evidence locations, not public download links. Runtime data, licensed
configuration and system source snapshots are excluded from this repository
and the module archive.
