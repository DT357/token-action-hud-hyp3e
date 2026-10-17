# Token Action HUD Hyperborea 3e Release Checklist

Use this checklist to record automated verification, runtime evidence and the
maintainer's release decision. A normal full sign-off requires the live matrix.

Published documentation release: `2026.10.17`. The maintainer requested validation against
hyp3e 4.6.0 and a release if TAH passed, then clarified that the sole failing
lighting assertion belongs to the upstream system rather than TAH. It is an
accepted, documented limitation for this release; raw results remain unchanged.
Any additional failure or unexpected page/console error blocks focused TAH
acceptance. This release changes documentation and version metadata only;
runtime source and compatibility declarations are unchanged. See
[COMPATIBILITY.md](COMPATIBILITY.md) for exact tested system identity and limits.

## Release identity

- [x] Previous published version/tag: `2026.10.16` / `v2026.10.16`
- [x] Current manifest ID, author and repository metadata match the package
- [x] CHANGELOG separates `2026.10.17` changes from previous releases
- [x] Maintainer authorized commit, push and release workflow execution
- [x] New calendar version and matching download URL use `2026.10.17`
- [x] README and release notes retain the upstream lighting limitation

Do not refresh an existing published tag/assets to deliver this update. Preserve the
untracked handoff and all unrelated work when preparing a release commit.

## Automated gate

Run from the `token-action-hud-hyp3e` directory:

```powershell
npm run release:check
```

- [x] All 50 Node tests pass for the October 17 candidate
- [x] All JavaScript syntax checks pass
- [x] Manifest ID, version, compatibility, dependency, and runtime paths validate
- [x] Two independent package builds are byte-identical
- [x] `dist/token-action-hud-hyp3e.zip` contains only the runtime allowlist
- [x] `module.json` is at the ZIP root
- [x] Manual-installation staging is refreshed and byte-validated
- [x] Repeat the gate after the release-version change

Run `npm run stage` to refresh and `npm run stage:check` to validate the ignored
`foundry_module/token-action-hud-hyp3e/` tree separately. `check` and `package`
also refresh it. Staging and ZIP packaging share one runtime allowlist.

## Artifact records

| Artifact | Size | SHA-256 | Meaning |
| --- | ---: | --- | --- |
| Published `2026.07.28` | 14,527 bytes | `105CE100A52E050DB9A230965FBFD1BEBA896090738B6732B97171DDEE4EE4E3` | Historical published baseline |
| October 1 visibility-fix ZIP | 14,569 bytes | `92C8A157A3A7003DA8A13F2577BD359C66D483D709FA10692977C7F7B60E167C` | Exact artifact used for focused runtime acceptance before README changes |
| Published `2026.10.01` | 14,951 bytes | `DC41F3FD298057FB2362C4A76F6B7AD2A1C4EEB8DB0A89739E41420E1C04BB03` | Published patch used for the initial October 16 validation |
| Published `2026.10.16` | 15,084 bytes | `191E552CE0315EC52C232E2F87B19A27990375AB9C01C7142E7DE50E18488118` | Unchanged archive used for initial 4.6.0 validation |
| `2026.10.17` candidate | 15,093 bytes | `C52DE3AE9E09718B662D08B461A2D930AE56C1943F2E2962FA22F60A3F78552A` | Runtime scripts and English localization match 2026.10.16; upstream lighting finding retained |

The documentation-only rebuild was 14,942 bytes with SHA-256
`458EA05FCD0320709D088A7BE4D7B9D87D673766EDA9A58C32D248BB5674C1D3`.
Workspace-only evidence is under `RuntimeTests/token-action-hud-hyp3e/`; it is
deliberately excluded from this public repository and its release archives.
Historical runtime evidence applies to its recorded artifact. October 1 patch
evidence is stored in `release-2026.10.01/`, and October 16 release evidence in
`release-2026.10.16/`. The current candidate uses `release-2026.10.17/`.

## Completed focused runtime evidence

- Workspace record `4.6.0-2026-10-17/assessment.txt`: hyp3e 4.6.0 at
  `58dad834ea295436e5d8cc39a180246eb488860f`, Foundry 13.351/14.369, Core 2.1.1,
  Socketlib 1.1.3. All 50 local tests and 48 privacy rolls passed; 24 broader
  regression groups completed. The only failing assertion on each generation
  is upstream lighting. No new TAH failure or page/console error was found.
  The initial strict release interpretation was corrected after the maintainer
  clarified ownership of that failure; historical raw evidence is preserved.
- Exact `2026.10.17` candidate: all 50 local tests and 48 visibility rolls
  passed. Both generations completed 12 broader regression groups, with only
  the exact known lighting finding. Raw regression results remain `ok: false`;
  focused TAH acceptance passes under the maintainer's clarified release scope.
  Final runs have no page/console errors and all owned ports closed. Runs under
  `release-2026.10.17/`: `v13/2026-10-17T13-38-23-080Z` (regression),
  `v13/2026-10-17T13-39-44-254Z` (visibility),
  `v14/2026-10-17T13-39-05-718Z` (regression), and
  `v14/2026-10-17T13-40-35-878Z` (visibility).
- Workspace record `latest-2026-10-16/assessment.txt`: hyp3e 4.5.0 at
  `5501f26d3db795eb27c114af9df644aa8628ea30`, Foundry 13.351/14.369, Core 2.1.1,
  Socketlib 1.1.3. The unchanged published October 1 ZIP passed 48 privacy rolls
  and completed 24 regression check groups. Both regression results retain the
  failing upstream lighting assertion and report `ok: false`. Final completed
  runs had no uncaught page errors; full compatibility sign-off remains withheld.
- Fresh `2026.10.16` candidate: 50 local tests and 48 privacy rolls passed;
  24 regression check groups completed, retaining the same lighting failure on
  each generation. Both raw regression results remain `ok: false`. Final runs
  had no page or console errors and all owned ports closed. Exact evidence:
  `release-2026.10.16/v13/2026-10-16T14-30-50-894Z` (regression),
  `v13/2026-10-16T14-32-07-795Z` (visibility),
  `v14/2026-10-16T14-31-54-788Z` (regression), and
  `v14/2026-10-16T14-33-39-336Z` (visibility) beneath that release directory.
- Workspace record `4.3.1-2026-10-01/assessment.txt`:
  Foundry 13.351/14.368, hyp3e 4.3.1, Core 2.1.1, Socketlib v1.1.3. Startup,
  groups, saves/checks, spell and charge consumption, selected synthetic actors,
  owner visibility and physical right-click received focused smoke coverage.
  Feature privacy failed; lighting affected multiple tokens sharing an Actor ID.
- Workspace record `feature-visibility-fix-2026-10-01/assessment.txt`:
  24/24 feature rolls passed per generation, covering GM/owner clients, linked
  characters, synthetic characters/NPCs, all four native privacy modes, chat
  recipients, blind flags, authors and selected-token speakers.

The versioned `2026.10.01` ZIP repeated all 48 visibility rolls on both
generations. Broader patch smoke checks repeat startup, action groups, native
dialogs/chat, consumption, ownership visibility and physical right-click. The
upstream lighting finding remains an explicit exception, not a passing assertion.
Exact runs and diagnostics are retained in workspace `release-2026.10.01/`.

The original v13 smoke needed a separate physical-right-click follow-up; its
timeout remains in the original result. Both assessments preserve the actual
run history. The checkboxes below are full-matrix requirements, not claims that
all of these scenarios have already passed on the current candidate.

## Live test environments

Use disposable worlds under `RuntimeTests/`, never live worlds. Test GM and owner
clients for shared or permission-sensitive workflows. Record exact installed
versions, artifact hashes, diagnostics and results for every supported row.

| Combination | Foundry | hyp3e / Core / Socketlib | Full-matrix result |
| --- | --- | --- | --- |
| Declared minimum supported dependencies | 13.351 | 3.8.0 / 2.1.0 / record compatible version | Pending |
| Current tested v13 build | 13.351 | 4.6.0 at `58dad834` / 2.1.1 / 1.1.3 | Pending |
| Existing verified declaration, if retained | 14.365 | Record supported dependency versions | Pending |
| Current tested v14 build | 14.369 | 4.6.0 at `58dad834` / 2.1.1 / 1.1.3 | Pending |

The earlier 14.365/hyp3e 3.8.3/Core 2.1.1 entry recorded a detected installation,
not a completed test. Neither it nor the focused 14.368/14.369 runs establishes a
signed full-matrix result. Do not change declared compatibility from expectation.

## Clean install and startup

Complete these checks in both Foundry environments:

- [ ] Back up the test world's data
- [ ] Remove or move aside any older `token-action-hud-hyp3e` installation
- [ ] Extract the release ZIP to `Data/modules/token-action-hud-hyp3e`
- [ ] Confirm `module.json` is directly inside that directory
- [ ] Start Foundry and enable Socketlib, Core and this module in a Hyperborea world
- [ ] Confirm there are no companion-module startup errors or deprecations
- [ ] Select no token and then multiple tokens; confirm the HUD remains stable
- [ ] Select a supported token and confirm the HUD initializes

## Character acceptance

Test a linked character and, where practical, an unlinked character token:

- [ ] Weapons open Hyperborea's attack workflow
- [ ] Missile range, targets, ammunition, and equipment enforcement behave normally
- [ ] All saving throws use current actor targets
- [ ] Tasks, attribute checks, concentration options, and Reaction work
- [ ] Features with non-empty formulas delegate to Hyperborea
- [ ] Features use their current saved visibility; verify recipients and blind state
- [ ] Features without a saved mode use the native system default
- [ ] Passive and effect-only features with no formula are absent
- [ ] Only populated spell-level groups appear
- [ ] Spell memorization enforcement behaves normally
- [ ] Inventory has no Gear subgroup
- [ ] Light-source actions honor fuel settings and update token light/effects
- [ ] Charged-item spells show charge cost/state and consume charges correctly
- [ ] Hidden charges display `??` to players and actual values to a GM
- [ ] Broken spell references are skipped without breaking valid actions
- [ ] Abilities has no Statuses subgroup; token right-click status assignment remains
- [ ] Unmodified right-click opens the correct item or referenced-spell sheet
- [ ] HP, AC, DR, casting ability, weight, quantity, equipment, and memorization
      changes refresh HUD metadata

## NPC and monster acceptance

Test linked and unlinked NPC tokens. Include both NPC and Monster NPC subtypes:

- [ ] Combat, Abilities, Spells, and Inventory appear only when supported
- [ ] Character-only Tasks and Attribute Checks are absent
- [ ] Morale uses the actor's current value
- [ ] Loyalty appears only to a GM for the NPC subtype
- [ ] Loyalty is absent for Monster subtype actors and player users
- [ ] Selecting a Monster actor does not throw a `GroupHandler.removeGroup` error
- [ ] NPCs without a casting ability do not receive an empty Spells group
- [ ] Weapons, saves, rollable features, spells, lights, and item spells work
- [ ] An unlinked token uses its synthetic token actor
- [ ] Unmodified right-click opens the correct sheet

## Other actor types and permissions

- [ ] An item-token actor receives only Inventory > Light Sources actions
- [ ] Item-token actors do not receive Combat, Abilities, Spells, Gear, or Item Spells
- [ ] Merchant and treasure actors contribute no system action groups
- [ ] Repeat representative actions as a non-GM player with normal ownership
- [ ] Actions the player cannot use fail through normal Hyperborea permissions

## Persistence and customization

- [ ] Customize group/action visibility or ordering through Core
- [ ] Reload the world and confirm Core retains the customization
- [ ] Change between character, NPC, monster, item-token, and unsupported tokens
- [ ] Confirm actor-specific group pruning does not corrupt the saved layout
- [ ] Reset the layout and confirm the defaults omit Statuses and Gear
- [ ] Reload Foundry and repeat one representative action from each major group

## Presentation and diagnostics

- [ ] Exercise supported themes, long names and constrained viewports
- [ ] Verify keyboard access, visible focus and accessible control names
- [ ] Exercise rapid updates and repeated token/scene changes
- [ ] Capture console/page errors and server logs with secrets redacted
- [ ] Explain each retained core/system warning or blocked external resource
- [ ] Stop owned servers and verify test ports close

Known upstream limitations: tested hyp3e 4.3.1, 4.5.0 and 4.6.0 fan light updates out to linked and
unlinked tokens sharing an Actor ID; native system roll dialogs emit V1
deprecations. Focused tests also captured software-rendering warnings and blocked
external resource errors. Keep these explicit; do not claim zero diagnostics.
Resolve the lighting contract upstream and decide its release impact before
full sign-off. No companion workaround has been implemented.

## Engineering and administration follow-ups

- [ ] Add non-publishing CI checks for branch pushes and pull requests
- [x] Verify whether `FOUNDRY_PACKAGE_RELEASE_TOKEN` is configured, without
      reading or recording its value

The release secret was confirmed configured again on October 17 through its name only.
The workflow
triggers only on version tags. The October 1 workflow and Foundry registration
succeeded. The [Foundry package listing](https://foundryvtt.com/packages/token-action-hud-hyp3e)
is public; publication verification below applies to the new candidate.

## Published-release verification

After the maintainer's release decision, prepare the candidate on `main` and
follow the guarded release procedure. Use a clean checkout of the committed
candidate so the workspace's intentionally untracked handoff stays untouched:

- [x] Run `npm run release:dry-run`
- [x] Confirm the reported version tag and release URLs
- [x] Run `npm run release:start` to create and push the annotated tag
- [x] Confirm the GitHub Release workflow succeeds
- [x] Confirm the workflow attached `module.json` and
      `token-action-hud-hyp3e.zip`
- [x] Confirm the workflow verified both public assets against the local files
- [x] Confirm Foundry registration succeeded, or document that the optional
      `FOUNDRY_PACKAGE_RELEASE_TOKEN` secret is not yet configured
- [x] Replace generated notes with reviewed, end-user release notes
- [x] Install through Foundry's public manifest-URL workflow on 13.351 and 14.369
- [x] Confirm version 2026.10.17 with Core and Socketlib enabled after reload
- [x] Compare the downloaded ZIP SHA-256 with the locally validated artifact

Current publication completed on October 17 from release commit
`b64a230b7494371203299a7ef2e448b5218eb793`, immutable tag `v2026.10.17`.
[Workflow 39037905741](https://github.com/DT357/token-action-hud-hyp3e/actions/runs/39037905741)
succeeded, including public asset verification and Foundry registration. The
actual registration response was `status: success`. The
[release](https://github.com/DT357/token-action-hud-hyp3e/releases/tag/v2026.10.17)
is public, neither draft nor prerelease, with reviewed notes. Both downloaded
assets match the tested candidate exactly. The raw lighting failures and
unchanged compatibility declarations remain explicit.

Public-manifest installation runs under `release-2026.10.17/`:
`manifest-v13/2026-10-17T13-47-11-998Z` and
`manifest-v14/2026-10-17T13-48-18-642Z`. Both installed matching bytes, launched
and reloaded with Core/Socketlib/TAH active, opened a native HUD save dialog,
had no page errors and closed their owned ports.

Previous publication completed on October 16 from release commit
`1752ef2d0b0a4157da7571e9ccb971e0437e2d01`, immutable tag `v2026.10.16`.
[Workflow 38917157146](https://github.com/DT357/token-action-hud-hyp3e/actions/runs/38917157146)
succeeded, including public asset verification and Foundry registration. The
actual Foundry response was `status: success`. The
[release](https://github.com/DT357/token-action-hud-hyp3e/releases/tag/v2026.10.16)
is public, neither draft nor prerelease. Both downloaded assets match the
validated candidate byte-for-byte. The artifact hash above is unchanged.

## Full-matrix sign-off (pending)

- Tester: ____________________
- Date: ____________________
- Foundry 13 result: ____________________
- Foundry 14 result and exact build: ____________________
- Minimum-dependency matrix: ____________________
- Candidate hash: ____________________
- Accepted upstream limitations: ____________________

Release decision: **Maintainer-authorized compatibility documentation release `2026.10.17`; full
support-matrix acceptance remains pending.** The documented upstream lighting
limit is retained; no broader compatibility claim is made.
