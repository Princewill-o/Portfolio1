# Pac-Man — Princewill’s Arcade

Original Canvas 2D fan implementation with a custom 21×23 maze, four ghost target personalities, scatter/chase cycles, frightened ghosts and returning eyes, power pellets, cherries, score and high score, three lives, a bonus life at 10,000 and increasing levels. All game graphics are drawn in code; the cartoon cover is concept artwork.

Run `node server.mjs`. Play with arrows/WASD, swipe or directional touch controls. P/Escape pauses; sound is opt-in. Browser high scores use localStorage. Build notes are included in the menu.

Run `node --test tests/rules.test.mjs`. Tests cover maze reachability, scoring, ghost-eating, fruit, bonus life, tunnel wrapping, movement, deaths, game-over, pause, level progression and valid ghost navigation. Browser visual testing remains pending in this environment.

This is a fan game, with no original ROM, official source code or ripped assets. Pac-Man’s name and characters belong to their respective owners.
