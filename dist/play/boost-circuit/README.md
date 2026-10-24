# Boost Circuit

A browser fan-game project by Princewill Okube.

## Run

Use Node.js 18+ and run `node server.mjs`, then visit http://localhost:4174. No install or build step is needed. Serve over HTTP rather than file://. Start-screen controls support keyboard and touch. Pause/restart and implementation notes are available in game.

## Art and rendering

Octane-style fan vehicle.

The game uses Three.js 0.180.0, GLB assets generated in Blender, baked colour/tangent-normal/ORM atlases, metric scale, named collections and editable source scenes. Character rigs use named deformation bones where relevant. The renderer provides Low/Medium/High/Ultra presets, environment reflections, soft shadows and selective post-processing. Graphics presets change presentation, not gameplay rules.

`models/stats.json` contains measured topology and UV bounds/seam data. `blender/scene.blend` is the editable model. `models/hero.glb` is the exported asset; reduced versions are included where available. `assets/model-render.png` is a Blender render, not a gameplay screenshot. Environment assets, where present, contain decoration only and do not add gameplay colliders.

## Source

- `rules.js`: rendering-independent game rules.
- `game.js`: input/presentation and scenes.
- `lib/core.js`: shared 3D UI/render setup (unused by the sprite renderer).
- `lib/graphics.js`: graphics presets and post-processing.
- `blender/`: editable assets and generation scripts.
- `vendor/`: pinned Three.js runtime and used addon dependencies; upstream MIT license is included.

## Validation

Run `node tests/rules.test.mjs`. Rules, GLB structure and scene updates were tested locally. Browser visual playtesting and hardware performance measurements remain pending because local browser automation is disabled. FPS targets are not guaranteed; the 3D games show a measured FPS/draw-call counter on the current device.

Character/game names refer to their respective franchises. Models are fan recreations with original geometry, not the exact source models shown in reference images. Third-party sprite art is credited separately. These compact prototypes are not complete reproductions of commercial games and have no multiplayer/backend.
