# Token Action HUD Hyperborea 3e Release Checklist

Use this checklist to record automated verification, runtime evidence and the
maintainer's release decision. A normal full sign-off requires the live matrix.

Release candidate: `2026.10.01`. The maintainer requested commit, push and release
workflow execution on October 1 after the documentation audit disclosed the
pending full matrix. This patch contains the visibility fix, staging tools and
documentation changes and retains existing compatibility declarations. Focused
patch acceptance does not mark the broader matrix complete.

## Release identity

- [x] Existing published version/tag: `2026.07.28` / `v2026.07.28`
- [x] Current manifest ID, author and repository metadata match the package
- [x] CHANGELOG separates `2026.10.01` changes from published `2026.07.28`
- [x] Maintainer authorized commit, push and release workflow execution
- [x] New calendar version and matching download URL use `2026.10.01`
- [x] README and release notes retain the upstream lighting limitation

Do not refresh the published tag/assets to deliver the local fix. Preserve the
untracked handoff and all unrelated work when preparing a release commit.

## Automated gate

Run from the `token-action-hud-hyp3e` directory:

```powershell
npm run release:check
```

- [x] All 50 Node tests pass in the October 1 local gate
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
| `2026.10.01` patch candidate | 14,951 bytes | `DC41F3FD298057FB2362C4A76F6B7AD2A1C4EEB8DB0A89739E41420E1C04BB03` | Versioned candidate for release workflow and fresh focused runtime checks |

The documentation-only rebuild was 14,942 bytes with SHA-256
`458EA05FCD0320709D088A7BE4D7B9D87D673766EDA9A58C32D248BB5674C1D3`.
Workspace-only evidence is under `RuntimeTests/token-action-hud-hyp3e/`; it is
deliberately excluded from this public repository and its release archives.
Historical runtime evidence applies to its recorded artifact. Fresh patch
evidence is stored in `release-2026.10.01/` under that workspace directory.

## Completed focused runtime evidence

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
| Current supported v13 build | Record exact build; focused evidence used 13.351 | 4.3.1 / 2.1.1 / v1.1.3 | Pending |
| Existing verified declaration, if retained | 14.365 | Record supported dependency versions | Pending |
| Current supported v14 build | Record exact build; focused evidence used 14.368 | 4.3.1 / 2.1.1 / v1.1.3 | Pending |

The earlier 14.365/hyp3e 3.8.3/Core 2.1.1 entry recorded a detected installation,
not a completed test. Neither it nor the focused 14.368 runs establishes a
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

Known upstream limitations: hyp3e 4.3.1 fans light updates out to linked and
unlinked tokens sharing an Actor ID; native system roll dialogs emit V1
deprecations. Focused tests also captured software-rendering warnings and blocked
external resource errors. Keep these explicit; do not claim zero diagnostics.
Resolve the lighting contract upstream and decide its release impact before
full sign-off. No companion workaround has been implemented.

## Engineering and administration follow-ups

- [ ] Add non-publishing CI checks for branch pushes and pull requests
- [x] Verify whether `FOUNDRY_PACKAGE_RELEASE_TOKEN` is configured, without
      reading or recording its value

The release secret is configured, verified through its name only. The existing
workflow triggers only on version tags. The
[Foundry package listing](https://foundryvtt.com/packages/token-action-hud-hyp3e)
is public and shows `2026.07.28`; checking whether it is listed is complete.

## Published-release verification

After the maintainer's release decision, prepare the candidate on `main` and
follow the guarded release procedure. Use a clean checkout of the committed
candidate so the workspace's intentionally untracked handoff stays untouched:

- [ ] Run `npm run release:dry-run`
- [ ] Confirm the reported version tag and release URLs
- [ ] Run `npm run release:start` to create and push the annotated tag
- [ ] Confirm the GitHub Release workflow succeeds
- [ ] Confirm the workflow attached `module.json` and
      `token-action-hud-hyp3e.zip`
- [ ] Confirm the workflow verified both public assets against the local files
- [ ] Confirm Foundry registration succeeded, or document that the optional
      `FOUNDRY_PACKAGE_RELEASE_TOKEN` secret is not yet configured
- [ ] Review the generated GitHub release notes
- [ ] Install once through Foundry's manifest-URL workflow
- [ ] Confirm Foundry displays the authorized version with Core and Socketlib enabled
- [ ] Compare the downloaded ZIP SHA-256 with the locally validated artifact

## Sign-off

- Tester: ____________________
- Date: ____________________
- Foundry 13 result: ____________________
- Foundry 14 result and exact build: ____________________
- Minimum-dependency matrix: ____________________
- Candidate hash: ____________________
- Accepted upstream limitations: ____________________

Release decision: **Maintainer-authorized patch release `2026.10.01`; full
support-matrix acceptance remains pending.** The documented upstream lighting
limit is retained; no broader compatibility claim is made.
