# Compatibility record

Reviewed October 17, 2026 for module **2026.10.17**. Installation and gameplay
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

The October 17 validation used the maintainer-provided official hyp3e **4.6.0**
reference at tag `v4.6.0`, commit
[`58dad834ea295436e5d8cc39a180246eb488860f`](https://github.com/thurianknight/hyp3e/commit/58dad834ea295436e5d8cc39a180246eb488860f).
Tests use an immutable local archive of that clean checkout. Neither the
read-only reference nor the separate active local system was changed by this work.

Historical October 16 evidence used hyp3e **4.5.0** at
[`5501f26d3db795eb27c114af9df644aa8628ea30`](https://github.com/thurianknight/hyp3e/commit/5501f26d3db795eb27c114af9df644aa8628ea30).
A shared version number does not make different system commits interchangeable
as compatibility evidence.

## Completed focused coverage

The initial October 17 checks used the published 2026.10.16 ZIP (15,084 bytes;
SHA-256
`191E552CE0315EC52C232E2F87B19A27990375AB9C01C7142E7DE50E18488118`).
All 50 local tests and 48 visibility rolls passed, and 24 broader regression
check groups completed. The only failing assertion on each generation was the
known upstream lighting behavior below; no companion failure was found. Final
runs had no page or console errors, and all owned ports closed.

The maintainer clarified that this system-owned finding should not block the
TAH release. The exact 2026.10.17 candidate repeated the focused checks:
50 local tests and 48 visibility rolls passed, and 24 broader groups completed
with only the same two upstream lighting findings. Its ZIP is 15,093 bytes,
SHA-256 `C52DE3AE9E09718B662D08B461A2D930AE56C1943F2E2962FA22F60A3F78552A`.
Final runs had no page/console errors and closed all owned ports. Gameplay scripts
and English localization are unchanged. This is focused companion acceptance,
not full compatibility sign-off or a claim that the lighting assertion passes.

| Foundry | Node | hyp3e | Core / Socketlib | Completed focused coverage |
| --- | --- | --- | --- | --- |
| 13.351 | 22.23.2 | 4.6.0 at `58dad834` | 2.1.1 / 1.1.3 | 12 regression check groups; 24 feature-visibility rolls; upstream lighting assertion fails |
| 14.369 | 24.15.0 | 4.6.0 at `58dad834` | 2.1.1 / 1.1.3 | 12 regression check groups; 24 feature-visibility rolls; upstream lighting assertion fails |

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
`ok: false`; it is not rewritten or reported as an overall passing suite.
Release acceptance distinguishes this reproduced system finding from companion
checks. Any additional failing assertion or unexpected page/console error still
blocks focused TAH acceptance.

The companion delegates to the selected Actor's public `toggleLightSource`
method. The tested system's `createActiveEffect` handling in
[`module/helpers/effects.mjs`](https://github.com/thurianknight/hyp3e/blob/58dad834ea295436e5d8cc39a180246eb488860f/module/helpers/effects.mjs#L443)
matches Canvas tokens by `token.actor.id`. The finding was also reproduced with
hyp3e 4.3.1 and 4.5.0. Resolve the intended Actor/token lighting semantics upstream;
this documentation release adds no companion workaround.

## Remaining acceptance

Full compatibility sign-off is withheld. Remaining work includes targeted
attacks, ammunition/range/equipment enforcement, fuel, exhaustive feature/effect
variants, charged-item cancellation, layout persistence, themes, keyboard and
viewport behavior, and the oldest declared dependency combinations. Branch/PR
CI checks remain open. Publication of 2026.10.17 succeeded in
[workflow 39037905741](https://github.com/DT357/token-action-hud-hyp3e/actions/runs/39037905741),
and Foundry registration returned `status: success`. The public manifest and ZIP
match the tested 2026.10.17 candidate. No gameplay feature is newly required by
this documentation update. Public-manifest installation passed on Foundry
13.351 and 14.369: installed bytes match, Core/Socketlib/TAH are active after
reload, and the HUD opens a native save dialog. Exact runs are in the release
checklist; all owned ports closed and no page errors occurred.

Workspace-only evidence is under `RuntimeTests/token-action-hud-hyp3e/`:
`4.6.0-2026-10-17/assessment.txt` records the initial 4.6.0 validation;
`release-2026.10.17/` records the new candidate and release decision.
`latest-2026-10-16/` and `release-2026.10.16/` retain historical 4.5.0 evidence.
These paths describe local
evidence locations, not public download links. Runtime data, licensed
configuration and system source snapshots are excluded from this repository
and the module archive.
