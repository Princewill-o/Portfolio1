# Voxel Trails portfolio adaptation

Adapted from the user-supplied minecraft-web-client-next (1).zip. Original MIT license is retained. Changes: main-menu identity/actions/CSS, loading text, config and standalone build notes. The engine, renderer, singleplayer implementation and world storage are upstream work.

Build using pnpm 10.32.1, `pnpm install`, `pnpm prepare-project`, then `DISABLE_SERVICE_WORKER=true CONFIG_JSON_SOURCE=BUNDLED pnpm build`. The portfolio serves the built dist directory at /play/minecraft/. Do not copy node_modules into the portfolio. Retain all license credits.
