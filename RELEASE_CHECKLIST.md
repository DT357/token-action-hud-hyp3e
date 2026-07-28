# Token Action HUD Hyperborea 3e Release Checklist

Use this checklist for every public release. Do not publish until both automated
verification and the live Foundry matrix pass.

## Release identity

- [x] Version follows `YYYY.MM.DD`: `2026.07.28`
- [x] Planned Git tag includes the required `v` prefix: `v2026.07.28`
- [x] `module.json` download URL names that tag and
  `token-action-hud-hyp3e.zip`
- [x] Author and repository metadata are correct
- [ ] Release notes describe user-visible changes and known limitations

## Automated gate

Run from the `token-action-hud-hyp3e` directory:

```powershell
npm run release:check
```

- [x] All Node tests pass
- [x] All JavaScript syntax checks pass
- [x] Manifest ID, version, compatibility, dependency, and runtime paths validate
- [x] Two independent package builds are byte-identical
- [x] `dist/token-action-hud-hyp3e.zip` contains only the runtime allowlist
- [x] `module.json` is at the ZIP root
- [x] Record the reported archive size and SHA-256 below

Archive size: 17,567 bytes  
SHA-256: `86C19A9F94C1FC49FFDACEE40746AD9A8C37BEF647716318FC00354A58330FD7`

## Live test environments

Use a clean test world for each row. Record exact installed versions.

| Foundry | Hyperborea 3e | Token Action HUD Core | Companion | Result |
| --- | --- | --- | --- | --- |
| 13.351 or latest Core-supported v13 | __________ | __________ | __________ | ☐ Pass ☐ Fail |
| 14.365 | 3.8.3 | 2.1.1 | 2026.07.28 | ☐ Pass ☐ Fail |

The local installation detected during Phase 5 preparation was Foundry 14.365,
Hyperborea 3e 3.8.3, and Token Action HUD Core 2.1.1. This records the available
environment only; it is not a live-test result.

## Clean install and startup

Complete these checks in both Foundry environments:

- [ ] Back up the test world's data
- [ ] Remove or move aside any older `token-action-hud-hyp3e` installation
- [ ] Extract the release ZIP to `Data/modules/token-action-hud-hyp3e`
- [ ] Confirm `module.json` is directly inside that directory
- [ ] Start Foundry and enable Core and this module in a Hyperborea world
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

## Published-release verification

After all live checks pass, commit and push the release candidate to `main`:

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
- [ ] Confirm Foundry displays version `2026.07.28` and both dependencies
- [ ] Compare the downloaded ZIP SHA-256 with the locally validated artifact

## Sign-off

Tester: ____________________  
Date: ____________________  
Foundry 13 result: ____________________  
Foundry 14.365 result: ____________________  
Release decision: ☐ Publish ☐ Block
