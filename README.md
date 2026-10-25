# Portfolio1

Princewill Okube’s desktop portfolio and Game Studio.

Run `node preview.mjs` (or `npm start`) with Node 24+ and visit http://127.0.0.1:4173. The Node server also handles private email-chat endpoints; opening files directly is not sufficient for all features.

The Games icon navigates to its own `games.html` application document. The desktop is not running underneath a Games popup. This app has its own title, favicon and standalone-display web manifest.

Startup was rebuilt after a full frame-by-frame timing study of the supplied 27.1-second video (see startup-video-study.md). It follows the logo, blue atmosphere, loading, and library-reveal structure with a shorter opening using the supplied MacTahoe Games icon. Press E, click or tap to load directly into the library. The selection interstitial is removed. The bold loading title reads “Princewill’s Game Studio”. The loading screen tracks actual artwork readiness, handles failures with an explicit Continue option, and keeps Skip available. Pointer-responsive particles, selected-world backgrounds, cover zoom reveals, optional original synthesized sound and motion controls are included. Escape backs out of loading; replay is in Settings. The portfolio opens Games in its own page. No playable build is implied for concept previews.

The current UI follows `PS5 Interactive UI (Community).zip`, supplied by the user. That archive contains exported PNG reference screens rather than executable application source. Its layouts were rebuilt as working HTML/CSS/JavaScript: Games/Media navigation, dark utility tiles, enlarged selected covers, full-background artwork, a lower-left game title and action, a project-status panel, a Discover screen with project cards, a sortable grid library, and a personal profile menu. The library contains eight personal projects, including six playable games; the commercial game titles shown in the reference pack are not presented as the user's work. Search, Media, reduced-motion controls and replay startup are available in the app.

Included projects: IlluminatED (external live site), a Sonic Burst 2 preview, Dragon Ball Sprite Arena (2D sprites), Boost Circuit, Voxel Trails, Rift Arena, Super Mario 65 (2.5D stages and a 3D world map), and Pac-Man (2D maze arcade). The six local games are integrated under dist/play/. Build notes and asset credits are included with each game.

Sonic, Mario and Pac-Man covers are custom AI-generated concept artwork, labelled as such. IlluminatED images and logo come from illumed.co.uk. The original Sonic environment image comes from Princewill-o/SonicClone on GitHub. Mac/iOS icons were extracted from the user's supplied references. The keyboard-and-mouse startup artwork was edited from the supplied controller scene using the built-in image generation tool.

Verification: JavaScript syntax, asset references, DOM selectors, HTTP asset responses, appearance behaviour, and DOM-based Games integration tests passed. Integration tests cover normal/reduced motion, keyboard selection, selected-project handoff, missing artwork recovery, skipping, replay cancellation and Escape. These are logic tests, not browser screenshots. Browser automation is disabled in Work settings, so the newest visual layout and timing have not been browser-verified.

Social links are configured in `dist/app.js`. Calendly is still unset; booking currently routes visitors to prepare an enquiry and connect on LinkedIn.

Appearance is managed by `appearance.js` / `.css`. The top-right appearance control offers Day, Night and Auto. Day shows the sunlit alpine ski resort; Night shows the same resort in moonlight with warm chalet lights. Auto follows the device's `prefers-color-scheme` setting and updates immediately when it changes. Manual preferences persist in localStorage (`po-theme`) and synchronize across tabs. Dark appearance changes the complete desktop, welcome screen, Finder windows, forms, search, menus, dock, notifications and Trash; the separate console Games app retains its cinematic dark design.

Appearance behaviour checks passed for Day/Night switching, colour scheme and dark surface state, persistence, Auto/device changes and cross-tab synchronization. The daylight image was generated with the built-in image generation tool; the nighttime image was edited from it to preserve the composition. Both are included as `dist/assets/alpine-day.webp` and `dist/assets/alpine-night.webp`.

Desktop folders can be dragged, moved with Alt + arrow keys, or reset from their three-dot/right-click menu. Delete/Backspace or Move to Trash hides a folder from the desktop. Dragging onto the dock's Trash also works. Undo, individual restore and Restore all are available; deleting a folder does not delete its portfolio content or project files. Positions and hidden folders are stored in this browser's localStorage, separately for desktop and mobile layouts. Reset desktop layout resets positions while leaving Trash intact.

The shared motion layer (`platform-motion.js` / `.css`) adds damped-spring tile selection, staggered project/library reveals, pointer-driven card depth and light, background parallax, profile and detail entrances, folder spring feedback, and native cross-page view transitions where supported. Motion stops when the page is hidden and respects the operating-system preference plus the in-app reduced-motion setting. The implementation uses browser animation APIs and has no third-party runtime dependency. Design references: https://motion.dev/docs/quick-start and https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API.

The existing Sites identity is retained in `.openai/hosting.json`. During the game-library update, the Sites connector returned `NOT_FOUND` for that identity, including the source-credential refresh. This updated source has therefore been preserved locally; publication of this update was not confirmed.

Safari launches from the compass dock icon on desktop and mobile. Its curated catalogue includes portfolio sections, project sites, the game collection and supplied social accounts. It supports suggestions, separate tab histories, back/forward, reload, new/close/reopen tabs, recent visits and browser-local favourites (`po-safari-favourites`). Ctrl/Cmd+L focuses the address, Ctrl/Cmd+T opens a tab, Ctrl/Cmd+W closes one, Ctrl/Cmd+Shift+T reopens it, and Alt+Left/Right navigates history. Search examples: `CV help`, `princewillcodes`, `portfolio://services`, and `illumed.co.uk`.

Portfolio sections render inside Safari. External pages show previews with explicit Visit links opening the live destination in a new tab. Games opens its standalone application. This is a portfolio browser, not a general internet browser. The enquiry form copies a prepared brief without sending it. Search input is escaped. Safari follows Day/Night and reduced-motion preferences. DOM integration checks passed for search, routing, tabs, history, favourites, enquiry handling, Games navigation and minimise/restore; browser visual verification remains unavailable.

The Games dock uses a blue PSN sign with the PlayStation symbol instead of the chess icon. Asset source: https://commons.wikimedia.org/wiki/File:PlayStation_logo.svg (Sony Interactive Entertainment; Commons lists the simple logo as PD-textlogo). The icon opens Princewill’s personal game collection; it does not connect to PSN.

The desktop menu bar now uses an Apple symbol and Finder/Safari application labels instead of the corner portrait and personal desktop title. Apple, File, Edit, View, Window and Help menus provide portfolio navigation, appearance, window controls, Safari tabs and lock-screen actions. These act on the portfolio, not the host operating system. Apple icon source: https://github.com/simple-icons/simple-icons/blob/develop/icons/apple.svg.

`macos-desktop.js` and `.css` add restrained window-launch easing, a curved minimise-to-dock effect, cancellable close/restore animations, anchored menu entrances, dock arrival, notification motion and refined system chrome. Finder and Safari are independent nonmodal windows inside the desktop, allowing the menu bar and dock to stay usable. Window focus controls their stacking and application label. Reduced motion bypasses window transitions. Tests cover menu actions, Apple identity, separate desktop windows, animation completion, cancellation and reduced motion. Current browser visual verification remains unavailable because local browser control is disabled in Work settings.


## MacTahoe update

The user-supplied MacTahoe-icon-theme-main.zip provides original SVG dock, folder, sidebar, Safari and Trash icons plus the loading spinner. The archive is an icon theme rather than a complete web UI. The site uses its original artwork with matching glass chrome and existing accessible motion. Asset aliases were resolved locally; source paths, GPL-3.0 license and authors are retained in dist/assets/tahoe/.

Safari contains the full project catalogue and two public project videos that autoplay muted. No resource gallery is appended below the desktop. Browser visual verification is unavailable in this environment; DOM interactions and HTTP assets were checked. Public GitHub publishing remains pending GitHub authentication.


## Current game and messaging update

Patchwork Planet has been removed from the published portfolio; its editable sources are retained outside dist. Seven fresh cartoon covers and a rebuilt Mario title over the existing castle concept illustration replace the studio model renders as library artwork. Cover art is promotional, not a screenshot.

Dragon Ball Sprite Arena now uses a new fixed-step combat engine with attack phases, buffered combos, uppercuts, hitstun, guard breaks, ki blasts, charge/release beams, beam clashes, teleport, ultimates and three transformation stages. It supports two characters, arcade, training and local versus. See the game README and tests for exact scope.

The desktop Messages app is backed by a private SQLite email bridge. Incoming email replies return to the original browser conversation. It remains explicitly unavailable until the required settings are supplied. See EMAIL-CHAT-SETUP.md; no real delivery is claimed before configuring and testing the provider.

Pac-Man is now a playable Canvas 2D game with its own maze, four ghost behaviours, power pellets, fruit, score, lives, levels, saved high score and touch controls. It replaces the former preview-only entry.

Voxel Trails now opens the adapted Minecraft Web Client at dist/play/minecraft/. The user-supplied MIT source was customized and built with its pinned package manager. Core engine credits, the upstream LICENSE and portfolio adaptation notes are included. The previous compact voxel experiment is retained separately in source. Browser world creation remains unverified; production bundling completed successfully.


## Finder, notifications and video

Finder now browses 71 portfolio folder/file entries, with back/forward/up navigation, breadcrumbs, icon/list views, folder search, pictures, text/source previews, downloads and muted video playback. The explicit Open a folder action uses the browser's directory picker with a file-input fallback. Chosen device folders are read-only and remain in browser memory; their contents are not uploaded.

The notification centre records actual portfolio activity and new email-chat replies. It supports unread badges, dismiss and clear controls. Private chat reply contents are not copied into notification storage. Safari project pages now embed their videos as well as showing them on the start page. Videos default to muted autoplay with controls; playback pauses when the page/window closes or is hidden.


## Latest viewport and startup changes

The Minecraft adaptation now caps GUI scale by both viewport dimensions, follows visualViewport changes, and uses a flexible scrollable main menu instead of fixed vertical offsets. The production client was rebuilt and copied to dist/play/minecraft/. Viewport checks cover desktop, phone portrait, landscape and keyboard-height sizes.

The Games dock icon and favicon use the newly supplied PS App image. Startup was revised from all 108 supplied reference frames: a 6.6-second PS-logo hold, 6.9-second blue-to-warm atmosphere, interactive Press E, real asset loading, and an ordered game-row/background/title/action reveal. The removed profile chooser remains removed. See startup-frame-study.md and startup-frame-analysis.csv.

The studio is now named Princewill’s Game Studio throughout its startup, app title and manifest. Each locally playable game lists its coding languages/tools and a plain-language description of their role in Project details. JavaScript/HTML/CSS, Canvas 2D, Three.js, TypeScript/React and the Blender/Python asset pipeline are described from the verified source.


## Latest game updates
Rift Arena has five articulated enemy designs, charge telegraphs and orbiting spread-shot enemies. Super Mario 65 includes an expanded original scenery kit, improved character material shading and a separate credited player for the user-supplied SM64 web port. The port is externally hosted and needs an internet connection; its commercial assets are not repackaged into this repository. Browser visual checks remain pending.

## Login
The decorative welcome uses a maths prompt (7 + 5; answer 12). It is a playful entry interaction, not access control.


## Desktop sticky notes
The contact/services note and theme-specific education note use paper colours, folded corners and CSS push pins. Night mode lists the MSc Artificial Intelligence at Queen Mary (2026–27), BSc Computer Science at City (2023–26), and two IBM credentials, sourced from the public LinkedIn profile. Day mode lists MSc Financial Engineering at WorldQuant University, supplied directly by Princewill, alongside fintech project services. No completion status or graduation date is asserted for the finance degree. Theme changes, device Auto and cross-tab preferences update the education note immediately.


## Notes app and direct day/night switch
Both paper notes now have draggable title bars, close/minimise/expand controls, a delete action and a resize grip. Minimise places a restore tile in the dock. The Notes dock app lists open, closed, minimised and deleted notes, restores individual notes and resets all notes and their layout. Geometry and visibility persist in localStorage; deleting a note is reversible and never removes project content. Keyboard: Alt + arrows on the title bar moves; arrows on the resize grip stretch; Ctrl/Cmd + M/W on the title bar minimises/closes. The sky switch changes Day/Night in one click, has a checked switch state, and updates wallpapers and credentials. Right-click it, Shift+F10, or use Apple → Appearance to choose Auto.


## Vercel hosting
Deploy the repository root with the supplied vercel.json. Static output is dist/; scripts/verify-deploy.mjs checks key entry points. Node 24 runs the small API availability adapter. Private .env files, local SQLite chat data and logs are excluded from uploads. The local preview.mjs backend still supports full email chat once configured. Vercel chat remains explicitly unavailable until an email service and durable database are integrated; no submitted message is accepted or stored by the adapter. Visitors can contact Princewill via the email and LinkedIn links in Messages.


## iPhone-style mobile shell
Phones up to 700 CSS pixels, and touch devices up to 1100 CSS pixels, use an iPhone-inspired home screen with status bar, app grid, widgets, dock and Home indicator. Larger desktop screens retain the Mac interface. Files/Finder, Safari, Messages and Notes open as full-screen touch pages with safe-area spacing; the welcome puzzle remains the entry point. Notes move to the visible mobile root and return to their original desktop parent when switching layouts. Mobile Home minimises open apps, while Notes remain recoverable. Settings offers the existing Day/Night/Auto controls.

The supplied 100+ Apple iOS 27 Screens (Community) archive was inspected as a visual reference; it contains exported images, not runnable app source. The UI is implemented in mobile-shell.js/css using existing portfolio assets. No exported phone frame screenshots are used as fake functional screens.

Game Studio has a compact scrollable game row and touch-sized actions. Locally implemented games use safe-area layouts, portrait/landscape menu rules, on-screen controls and interrupted-touch cleanup. Minecraft retains its upstream mobile UI and previously implemented viewport-scaling system. The externally hosted SM64 port still needs a keyboard and is labelled accordingly; the local Mario 65 has touch controls. Real iPhone/Android device visual playtests remain pending; DOM/scene/input checks are not hardware compatibility or FPS certification.
