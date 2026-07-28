# Token Action HUD Hyperborea 3e

Token Action HUD Hyperborea 3e is a companion module that connects
[Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core)
to the Hyperborea 3rd Edition game system.

## Project status

The Phase 5 release candidate provides the complete planned functional action set:

- a Combat group with Weapons and Saving Throws;
- weapon attacks for character and NPC actors through Hyperborea's `rollItem`
  workflow;
- all five current saving throws through Hyperborea's `rollSave` workflow;
- character tasks, natural ability checks, and Charisma reaction rolls;
- character and NPC features with assigned roll formulas;
- dynamically generated spell-level groups;
- character and NPC light-source actions;
- NPC Morale checks and GM-only Loyalty checks for NPC-subtype actors;
- light-source actions for item-token actors;
- charged-item spells for character and NPC actors, with individual spell
  actions, charge cost/current charge state, and Hyperborea charge consumption;
- actor-specific layouts that keep unsupported groups quiet for merchants,
  treasure actors, and other unsupported actor types;
- current HP, AC, DR, casting ability, carried-weight, quantity, equipment, and
  memorization state in the HUD;
- item-sheet opening on an unmodified item or light-action right-click;
- referenced-spell sheet opening on an unmodified charged-spell right-click;
- localized action state, specialized tooltips, and Core debug logging for
  dispatch and broken spell references;
- safe handling for stale or malformed HUD actions.

Automated tests, syntax validation, manifest validation, and deterministic release
packaging are in place. The live Foundry 13/14 matrix in the
[release checklist](https://github.com/DT357/token-action-hud-hyp3e/blob/main/RELEASE_CHECKLIST.md)
remains the final release gate. The first public release is planned after that
matrix passes.

## Requirements

- Foundry Virtual Tabletop 13 or 14. The effective Foundry 13 minimum is 13.351
  because that is the minimum supported by Token Action HUD Core 2.1.1.
- Hyperborea 3rd Edition 3.8.0 or later within its supported Foundry range.
- Token Action HUD Core 2.1.x.

## Installation

Token Action HUD Hyperborea 3e requires both Hyperborea 3rd Edition and Token
Action HUD Core.

To install from a published release:

1. Install Hyperborea 3rd Edition and Token Action HUD Core from Foundry's package
   manager.
2. In Foundry's **Add-on Modules** tab, choose **Install Module** and paste:
   `https://github.com/DT357/token-action-hud-hyp3e/releases/latest/download/module.json`
3. Enable Token Action HUD Core and Token Action HUD Hyperborea 3e in a Hyperborea
   world.
4. Select a supported token. If the world contains a layout saved by an earlier
   development version, reset the Token Action HUD layout once.

For a manual test install, extract the release ZIP so that `module.json` is at
`Data/modules/token-action-hud-hyp3e/module.json`, restart Foundry, and enable the
two modules in a Hyperborea world.

## Compatibility

The release manifest declares Foundry 13 as its minimum and Foundry 14.365 as its
verified version. Token Action HUD Core 2.1.1 raises the effective Foundry 13 floor
to 13.351. The supported dependency baseline is:

| Component | Supported baseline |
| --- | --- |
| Foundry Virtual Tabletop | 13.351 or later in generation 13; 14.365 |
| Hyperborea 3rd Edition | 3.8.0 or later within its Foundry-supported range |
| Token Action HUD Core | 2.1.x |

Compatibility claims are finalized only after the live matrix in the
[release checklist](https://github.com/DT357/token-action-hud-hyp3e/blob/main/RELEASE_CHECKLIST.md)
passes.

## Development

The module uses unbundled JavaScript modules and has no runtime npm dependencies.
From this directory:

```shell
npm test
npm run check
npm run release:check
npm run release:plan
npm run release:dry-run
```

`npm test` runs the Node test suite. `npm run check` also validates JavaScript
syntax. The architecture test rejects module-owned use of legacy Foundry
`Application`, `FormApplication`, and `Dialog` APIs as well as jQuery. Any future
UI owned by this module must use Foundry's ApplicationV2 framework available in
Foundry 13 and 14.

`npm run release:check` runs the full automated gate and creates
`dist/token-action-hud-hyp3e.zip`. The packaging test builds the archive twice and
requires byte-identical output. The archive uses an explicit runtime allowlist, so
tests, development tools, reference projects, and maintainer documents are not
shipped accidentally.

## Release workflow

The release process has a local gate and a tag-triggered GitHub Actions workflow:

1. Update `module.json` for the new `YYYY.MM.DD` version, including its matching
   `releases/download/vYYYY.MM.DD/token-action-hud-hyp3e.zip` URL.
2. Complete the live Foundry matrix and sign-off in `RELEASE_CHECKLIST.md`.
3. Commit the release candidate to `main` and push it to
   `DT357/token-action-hud-hyp3e`.
4. Run `npm run release:dry-run`. This repeats the automated gate and, once this
   directory is a Git checkout, verifies a clean `main`, the GitHub remote, the
   remote commit, and tag availability without changing Git.
5. Run `npm run release:start`. It repeats those checks, creates the annotated
   `vYYYY.MM.DD` tag, and pushes only that tag.

The tag starts `.github/workflows/release.yml`. GitHub rebuilds the deterministic
archive, creates a release with generated notes, attaches `module.json` and
`dist/token-action-hud-hyp3e.zip`, and downloads both public assets to verify that
they are byte-identical to the validated local files. If the repository secret
`FOUNDRY_PACKAGE_RELEASE_TOKEN` exists, the workflow then registers the immutable
release manifest URL with Foundry. Without that secret, Foundry registration is
reported as skipped while the GitHub release still completes.

One-time repository setup is still required: make this module directory the root
of the GitHub repository, permit GitHub Actions to request `contents: write`, and
submit the initial package to Foundry for approval. Foundry supplies the package
release token only after the package page exists; store that token as the
`FOUNDRY_PACKAGE_RELEASE_TOKEN` GitHub Actions secret. Tokens must never be
committed to the repository.

Token Action HUD Core owns the HUD application. Hyperborea owns its actor and item
sheets, roll dialogs, chat cards, and rules workflows. This module delegates to
those public interfaces instead of duplicating their behavior.

## Troubleshooting

- **The HUD is absent:** confirm the world uses the `hyp3e` system and that both
  Token Action HUD Core and this module are enabled. Check that the dependency
  versions meet the compatibility table above.
- **Groups or actions are missing after an update:** reset the Token Action HUD
  layout. Core intentionally preserves user-customized layouts, which may not gain
  new default groups automatically.
- **A monster token causes a `GroupHandler.removeGroup` error:** install the
  current release candidate, restart Foundry, and reset the saved HUD layout. The
  current module supplies Core's active HUD model when pruning actor-specific
  groups.
- **An action affects the wrong actor:** select the intended token before using the
  HUD. Unlinked tokens use their synthetic token actor rather than the base world
  actor.
- **An item spell is absent:** confirm the item is identified, not In Storage, has
  a valid spell UUID, and is on a character or NPC. Item-token actors intentionally
  do not expose charged-item spells.
- **Loyalty is absent:** Loyalty is GM-only and appears only for NPC actors whose
  NPC Type is NPC. Monster-subtype actors still receive Morale but not Loyalty.
- **A problem remains:** enable Token Action HUD Core debug logging, reproduce the
  issue, and report the Foundry, Hyperborea, Core, and companion-module versions
  with the browser-console stack trace.

## Phase 1 Foundry smoke test

If the world saved or customized the Phase 0 placeholder layout, reset the Token
Action HUD layout before testing so Core loads the new Weapons and Saving Throws
subgroups.

Test both a linked character token and an unlinked NPC token:

1. Select the token and confirm Combat contains Weapons and Saving Throws.
2. Click a melee weapon and confirm the normal Hyperborea attack dialog and chat
   workflow.
3. Click a missile weapon with a target and confirm range and ammunition behavior.
4. Roll Death, Device, Transformation, Avoidance, and Sorcery saves and compare
   their targets with the actor sheet.
5. Right-click a weapon without modifiers and confirm its embedded item sheet
   opens without an attack roll.
6. For the unlinked NPC, confirm the selected token actor—not its base world
   actor—is used.
7. Repeat a character weapon attack with Hyperborea's weapon-equipment enforcement
   enabled and disabled.

## Phase 2 Foundry smoke test

Reset the Token Action HUD layout before testing so Core loads the new Abilities,
Spells, and Inventory groups.

Test a linked character token:

1. Confirm the HUD contains Combat, Abilities, Spells, and Inventory.
2. Confirm Combat shows current/max HP, AC, and DR.
3. Roll all five Tasks and compare their current targets with the actor sheet.
4. Roll the Strength and Dexterity Tests/Feats, Constitution Trauma
   Survival/Test/Feat, and both Learn Spell checks.
5. Enable Hyperborea's optional Intelligence and Wisdom concentration checks,
   confirm both appear with the configured formula, then disable the option and
   confirm they disappear.
6. Roll Charisma Reaction and confirm the current reaction modifier and normal
   Hyperborea reaction-table workflow are used.
7. Use a feature with a non-empty roll formula and confirm Hyperborea handles the
   check, dialog, effects, and chat. Confirm passive and effect-only features with
   no formula are absent.
8. Confirm spells appear only under populated Level 1 through Level 6 subgroups.
   Test a memorized spell and a zero-memorization spell with Hyperborea's
   memorization enforcement enabled and disabled.
9. Confirm Inventory contains Light Sources and, when applicable, derived Item
   Spells, but no Gear subgroup.
10. Right-click representative feature, spell, and light actions without modifiers
    and confirm the correct item sheet opens without using the item.
11. Toggle a light source with Hyperborea's fuel requirement enabled and disabled.
    Confirm fuel, token light, and Active Effects follow the actor-sheet workflow.
12. Change HP, AC, DR, casting ability, weapon quantity/equipment, spell
    memorization, and carried weight and confirm Core refreshes displayed state.
13. Confirm Abilities has no Statuses subgroup; assign statuses through the
    token's right-click controls instead.
14. Select an NPC token and confirm the Phase 1 Combat actions remain available.
    The Phase 3 test below covers its additional actor-specific groups.

## Phase 3 Foundry smoke test

Reset the Token Action HUD layout before testing so Core loads the new NPC Checks
subgroup.

Test both a linked NPC token and an unlinked NPC token, including at least one
actor whose NPC Type is Monster:

1. Confirm the HUD contains Combat and Inventory, Abilities contains Features and
   NPC Checks, and character-only Attribute Checks and Tasks are absent.
2. Confirm Weapons and Saving Throws still use the normal Hyperborea workflows.
3. Use representative rollable feature, spell, and light-source actions and
   confirm the selected token actor is used, including for the unlinked token.
4. Roll Morale and confirm a 2d6 check uses the actor's current Morale target.
5. As a GM, confirm Loyalty appears only for an actor whose NPC Type is NPC and
   uses its current value. Confirm it is absent for monster-type actors and for a
   player user.
6. Confirm there is no Hit Dice action.
7. Confirm populated spell-level groups appear for an NPC with a casting ability,
   and that the entire Spells group is absent for an NPC without one.
8. Confirm weapon quantity/equipment and spell memorization metadata reflect the
   current NPC data, and that items marked In Storage are excluded.
9. Right-click representative feature, spell, and light actions without
   modifiers and confirm the correct item sheet opens without using the item.

Test an item-token actor:

1. Confirm only Inventory > Light Sources system actions are present.
2. Confirm light sources work against the selected item-token actor.
3. Right-click a light source without modifiers and confirm its sheet opens
   without using it.
4. Confirm weapon attacks and the Combat, Abilities, and Spells groups are absent.

Finally, select merchant and treasure actors and confirm the module contributes no
system action groups for those unsupported actor types.

## Phase 4 Foundry smoke test

Test both a linked character token and an unlinked NPC token:

1. Give the actor an identified charged item with one or more spell references.
   Confirm Inventory gains one Item Spells action per valid reference.
2. Confirm each item-spell action displays its charge cost and current/max item
   charges. As a player, confirm an item configured to hide charges displays
   `??`; as a GM, confirm its actual charges remain visible.
3. Cast representative item spells and confirm Hyperborea uses the item's casting
   ability, runs its normal spell workflow, enforces available charges, and
   deducts the configured charge cost.
4. Right-click an item-spell action without modifiers and confirm the referenced
   spell sheet opens without casting or consuming charges.
5. Confirm character items marked unidentified or In Storage do not expose their
   charged spells.
6. Add a broken spell UUID beside a valid reference and confirm the valid action
   remains usable. With Core debug logging enabled, confirm the skipped UUID is
   reported without a user-facing failure.
7. Confirm tooltips provide the full item-spell source when Core tooltips are
   enabled.

Finally, confirm item-token actors retain their Phase 3 light-only scope and do
not gain Item Spells. Hyperborea's item-token sheet does not expose a
charged-spell workflow, so the module does not invent one.

## License and third-party works

Original source code in this package is available under the [MIT License](LICENSE).
This package is designed for Foundry Virtual Tabletop and is distributed subject
to Foundry's
[Limited License for Package Development](https://foundryvtt.com/article/license/).

Token Action HUD Core and Hyperborea 3rd Edition are required/reference projects;
their code, content, assets, names, and trademarks are not relicensed by this
package and remain the property of their respective owners.
