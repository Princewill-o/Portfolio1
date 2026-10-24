# Startup video study and implementation

The full supplied PS5 Startup Screen.mp4 runs for approximately 27.1 seconds. All 54 half-second samples were inspected across three contact sheets; the transition sequence was mapped before rebuilding the startup.

| Video time | Visual structure | Portfolio adaptation |
| --- | --- | --- |
| 0–6 seconds | Held logo on black | Short PO mark reveal with four project thumbnails |
| 6.5–9 seconds | Text over a dark blue glow | Quiet blue atmosphere before the start interaction |
| 9–13 seconds | Glow expands into particles and light | Continuous pointer-responsive particles and soft light |
| 13.5–18 seconds | Player selection appears | Choose a world: IlluminatED, Sonic Burst 2, Super Mario 65, Pac-Man |
| 18.5–20 seconds | Selection dissolves; tile row arrives | Selected project cover, artwork-readiness indicators and zoom transition |
| 21–27 seconds | Full world background and game interface | Chosen project opens with matching hero artwork in the Games collection |

The portfolio shortens the passive opening to 1.85 seconds. The visitor controls the rest with E, arrow keys, Enter, mouse or touch. Skip stays available throughout. Escape backs out of loading and selection, while Settings can replay the startup.

The progress indicator measures successful image loading rather than pretending to load a playable game. Missing art produces a clear Continue option. Sonic Burst 2, Super Mario 65 and Pac-Man covers are labelled concept artwork; actual playable links have not been supplied. IlluminatED uses real project imagery.

Optional original synthesized tones are off by default. OS and in-app reduced-motion preferences remove cinematic motion. The reference soundtrack was not copied.

Validation: source/syntax checks and DOM integration tests passed in normal and reduced-motion configurations, including chosen-project handoff, failed image handling, skip, cancellation, replay and Escape. Browser visual verification was unavailable because local browser control is disabled in Work settings.
