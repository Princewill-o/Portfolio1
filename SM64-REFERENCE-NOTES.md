# SM64 reference integration and REA analysis

Reference: https://manscod.github.io/other/sm64/
REA: https://github.com/morluto/rea (CLI version 6.7.0).

The supplied HTML boots an Emscripten Module on a WebGL canvas and loads sm64.us.f3dex2e.js. Direct inspection of that downloaded loader identifies sm64.us.f3dex2e.wasm as the companion binary. The page declares arrow movement, X jump, C attack, Space crouch, Enter start and WASD camera controls.

REA was run locally against the downloaded HTML/JavaScript, without executing the remote game. The complete pass timed out at 45 seconds. A second pass selecting only the loader, limiting retained semantic nodes and allowing 180 seconds also returned provider_timeout. Partial inventory is not a completed reconstruction. No native model/source recovery, runtime validation, WASM decompilation or source modification is claimed.

Downloaded JavaScript SHA-256: f0c949300de681b2b1326879ed9db4857c4f8d8260686d3ae5465b20c51151d0.

The portfolio uses a credited external iframe with fullscreen, keyboard help, reload, close/unload and a direct original-page link. Its availability depends on the external host. Original local Super Mario 65 remains independently playable and its graphics were updated through new runtime scenery geometry and material shading. The external SM64 port's models were not changed or repackaged.
