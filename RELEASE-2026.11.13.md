# Release 2026.11.13: hyp3e 4.9.2 verification

The maintainer requested an updated release recording hyp3e 4.9.2 as the most
recent verified system version. Runtime scripts and translations are unchanged
from 2026.10.17. Existing minimum requirements and the historical Foundry
14.365 declaration remain unchanged; the hyp3e relationship adds verified 4.9.2.

## Exact candidate and checks

- Tag: `v2026.11.13`; ten allowlisted files with `module.json` at the ZIP root.
- ZIP: 15,120 bytes, SHA-256
  `49bb8528081095516c6bc01115c65965539ef9e6b886f320e8ae02c4850b0a0d`.
- Independent package builds are byte-identical; source, staging and the
  extracted runtime files match the tested candidate.
- `npm run release:check`: all 50 tests, syntax checks, manifest checks,
  packaging and staging pass. The sandbox's junction-test restriction was
  resolved by rerunning the unchanged test with approved host access.
- System: published hyp3e 4.9.2, tag commit
  `ad53440d19f2677211e64bc0fdd89dfeddfc47e9`; system ZIP SHA-256
  `4fb31dc9629ef9c89811c205f01bcfe93c299b08e1317a46a266c4e14f539509`.
- Cores: Foundry 13.351 / Node 22.23.2 and Foundry 14.369 / Node 24.15.0.
- Dependencies: Core 2.1.1, Socketlib 1.1.3, Playwright 1.63.0, installed
  Microsoft Edge in isolated contexts with software WebGL.

## Focused runtime acceptance

All 48 feature-roll privacy checks pass: GM and owner accounts, linked and
synthetic character/NPC Actors, and each native roll-visibility mode.
All 24 broader regression groups complete across the two generations. They
cover HUD registration, common action groups, native saves/checks and dialogs,
spell/charge consumption, synthetic-Actor isolation, NPC morale/loyalty,
permissions, hidden charges and native Item sheets.

Both raw broader results remain `ok: false` solely for the previously accepted
upstream `selected-linked-token-light` finding: other linked/unlinked tokens
sharing the Actor also light up. There is no companion workaround and no new
unclassified diagnostic failure. Known native-system ApplicationV1 deprecations,
software-rendering warnings and the deliberately untargeted weapon notice
remain recorded. The full minimum-dependency, targeted attack/ammunition/range,
light-fuel and layout/theme matrix is still incomplete.

Evidence is local under `RuntimeTests/releases-hyp3e-4.9.2-2026-11-13/token-hud/`;
`ACCEPTANCE.json` records the focused acceptance separately from the unchanged
raw failed lighting results. Sandbox startup failures remain as setup evidence.
Temporary license copies were removed after each completed run.

## Publication verification

The tag workflow builds and publishes the deterministic archive, verifies the
public assets and registers the version with Foundry when the repository release
credential is configured. Public downloads and native manifest installation
results are recorded after publication. The local handoff remains untracked.
