# Dragon Ball Sprite Arena

A Canvas 2D fan fighting game by Princewill Okube. Run `node server.mjs` and open the local URL. The portfolio integrates it at `/play/nova-duel/`.

## Play

Pick Goku or Vegeta and Arcade, Training or Local versus. Arcade has three successive arenas and best-of-three matches. Training uses a replenishing dummy; versus requires a second player and a numeric keypad. All controls and frame/asset credits are in the game's How it was made panel.

A/D move; Space jump; F toggles flight; W/S ascend/descend; Shift dashes; Q teleports behind the rival. J punches, K kicks, S+J uppercuts, and J after three connected hits finishes a combo. I fires ki. Hold O and release for Kamehameha/Galick Gun. U spends 80 ki on Super Kamehameha/Final Flash. C charges ki. T transforms at 60/80/95 ki through Super Saiyan, Super Saiyan 2 and Blue. L guards. P/Escape pauses. Touch controls are available.

## Implementation

`combat.js` is a deterministic fixed-step simulation: startup/active/recovery phases, buffered input, hitstun, knockback, combo scaling, guard breaks, swept projectiles, beam clashes, AI and match rules. `fighter-game.js` maps it to animated sprite frames, custom palette effects, character-specific beam names, hit-stop and accessible motion settings. `arena-background.js` draws the three arenas. `rules.js` re-exports the simulation API.

Golden Super Saiyan sprites come from the credited sheets. SS2 is an aura/lightning variant, Blue is a runtime palette treatment, not a newly hand-drawn animation sheet. This is a two-character fan game, not a complete reproduction of Dragon Ball Devolution. Old Blender studies are retained as source but are not the active game renderer.

Run `node --test tests/combat.test.mjs`. Tests cover attack timing, guard breaks, three transformation transitions, resource costs, projectile collision, beam clashes, local versus, teleport and complete AI matches. Browser visual playtesting is still pending because browser control is disabled in this environment.

See ASSET-CREDITS.md for sprite provenance. Cartoon cover art is promotional concept artwork, not a gameplay screenshot.
