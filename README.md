# Token Action HUD Hyperborea 3e

Token Action HUD Hyperborea 3e puts frequently used Hyperborea 3rd Edition
actions into a movable HUD. Select a token to attack, make checks and saving
throws, cast spells, use light sources, and activate charged items without
opening the actor sheet.

This is a companion for
[Token Action HUD Core](https://github.com/Larkinabout/fvtt-token-action-hud-core).
Token Action HUD Core provides the HUD, while this module adds support for the
Hyperborea 3rd Edition game system.

## Requirements

- Foundry Virtual Tabletop 13.351 or later within version 13, or Foundry 14.
- Hyperborea 3rd Edition 3.8.0 or later.
- Token Action HUD Core 2.1.x.
- Socketlib, which Token Action HUD Core requires.

### Recent compatibility checks

On October 16, the HUD was checked with Hyperborea **4.5.0**, Token Action HUD
Core **2.1.1** and Socketlib **1.1.3** on Foundry **13.351** and **14.369**.
These checks covered common actions and feature-roll visibility. Some actions
and display options still need broader testing. The lighting issue below
remains.

## Installation

1. Install **Hyperborea 3rd Edition** and **Token Action HUD Core** in Foundry.
   Allow Foundry to install Core's required dependency, **Socketlib**, too.
2. Open Foundry's **Add-on Modules** tab and select **Install Module**.
3. Paste this address into the **Manifest URL** field:

   `https://github.com/DT357/token-action-hud-hyp3e/releases/latest/download/module.json`

4. Select **Install**.
5. Open a Hyperborea world and enable **Socketlib**, **Token Action HUD Core**,
   and **Token Action HUD Hyperborea 3e**.

## Using the HUD

Select a supported token on the canvas. The HUD will show actions appropriate
for that actor.

- Left-click an action to use it.
- Right-click an item-based action to open the relevant item or spell sheet.
- Move, lock, resize, or customize the HUD using Token Action HUD Core's
  controls.
- Assign conditions and statuses through Foundry's token controls.

If you update the module and do not see the latest groups, use Token Action HUD
Core's **Reset HUD** option once. Core normally preserves each user's customized
layout between updates.

## Available actions

### Combat

- Melee and missile weapons.
- Death, Device, Transformation, Avoidance, and Sorcery saving throws.
- Current hit points, armour class, and damage reduction are shown in the group
  summary.

Weapon attacks use Hyperborea's normal attack process, including targeting,
range, ammunition, and equipment rules.

### Abilities

Characters can access:

- Attribute checks and tests.
- Tasks.
- Charisma reaction rolls.
- Features that have a roll assigned to them.

NPCs and monsters can access their rollable features and Morale. Loyalty is
available only to the GM and only for actors whose NPC Type is **NPC**.

Passive features and features without a roll are intentionally omitted.
Statuses are also omitted because they can be assigned through the token's
right-click controls.

### Spells

Spells are organized by spell level, and empty levels are hidden. Casting uses
Hyperborea's normal spell rules, including memorization requirements when those
rules are enabled.

NPCs also need a casting ability for the Spells group to appear.

### Inventory

The Inventory group contains:

- Light sources.
- Spells provided by charged items. Characters must identify the item first;
  NPCs do not have that restriction.

Light sources use Hyperborea's normal fuel, lighting, and effect settings.
Charged-item spells show their charge cost and remaining charges, and using one
consumes charges normally. Players see `??` when an item's charges are hidden;
the GM can still see the actual value.

Ordinary gear is intentionally omitted because it is rarely needed for quick
combat access. Items marked **In Storage** are not shown.

## Supported actors

- **Characters:** Combat, Abilities, Spells, light sources, and charged-item
  spells as appropriate.
- **NPCs and monsters:** Combat, rollable features, NPC checks, Spells, light
  sources, and charged-item spells as appropriate.
- **Item tokens:** Light sources only.
- **Merchants and treasure actors:** No Hyperborea action groups are added.

Linked and unlinked tokens are supported. Actions use the actor belonging to
the currently selected token. See the lighting issue below when several tokens
share one actor.

## Known issues

### Feature roll visibility in older versions

Version **2026.10.01** fixes feature rolls ignoring their saved visibility.
Feature rolls now start with the visibility saved on the feature. You can change
it in the roll window before selecting **Roll**.

If you still use **2026.07.28**, check the visibility choice before rolling,
especially for private or blind rolls.

### Lights on several tokens of the same actor

With Hyperborea **4.3.1 and 4.5.0**, toggling a light can change the lighting on other
tokens of the same actor, including unlinked tokens. This comes from the
Hyperborea system's light handling. If you use several tokens of one actor,
check their lighting after toggling a light.

## Troubleshooting

### The HUD does not appear

- Confirm the world is using the Hyperborea 3rd Edition system.
- Confirm Socketlib, Token Action HUD Core, and this module are enabled.
- Select a character, NPC, monster, or item token.
- Check that the installed versions meet the requirements above.

### A group or action is missing

- Reset the HUD through Token Action HUD Core after updating.
- Confirm the actor supports that type of action.
- Rollable features require an assigned roll.
- Empty spell levels are hidden.
- Characters must identify a charged item before its spells appear.
- Items marked **In Storage** do not provide item-spell actions.
- Loyalty is visible only to the GM for NPC-type actors.

### An action uses the wrong actor

Select the intended token before using the HUD. For an unlinked token, the HUD
uses that token's own actor data.

### Reporting a problem

Open an issue on the
[GitHub issue tracker](https://github.com/DT357/token-action-hud-hyp3e/issues).
Include:

- Your Foundry version.
- Your Hyperborea 3rd Edition version.
- Your Token Action HUD Core version.
- This module's version.
- The actor type and action involved.
- A screenshot or any error message shown in the browser console.

## Updates and releases

Release notes and downloads are available on the
[GitHub Releases page](https://github.com/DT357/token-action-hud-hyp3e/releases).
Foundry uses the manifest URL above to check for new versions.

## License and acknowledgements

Token Action HUD Hyperborea 3e is available under the [MIT License](LICENSE).

This package is designed for Foundry Virtual Tabletop and is distributed subject
to Foundry's
[Limited License for Package Development](https://foundryvtt.com/article/license/).
Token Action HUD Core and Hyperborea 3rd Edition remain the property of their
respective authors.
