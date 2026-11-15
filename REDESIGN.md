# Cinematic Editorial frontend

The approved Home prototype supplies WatchMate's visual identity: warm charcoal, ivory, jade, self-hosted Geist, artwork, and restrained chrome. The remaining pages adapt that identity to browsing, tracking, collections, social activity, and forms. Home retains its own composition.

## Finding the styles

`src/index.css` imports `globals.css`, `product.css`, `pages.css`, and `media.css` in that order. Home lazy-loads `editorial.css` separately.

- `globals.css`: theme variables, font, base styles and original motion utilities. Background `#111210`, ivory `#f2f0e8`, jade action `#69c49a`, dark action ink `#102319`. Surfaces step through `#1b1e19`, `#23271f`, `#30362c`. Control/panel/media radii are 8/12/8px.
- `product.css`: shared `wm-` component hooks, shell/navigation, form controls, dialogs, feedback, focus and reduced-motion rules. It deliberately overrides legacy utility styling without changing component behavior.
- `pages.css`: page-specific compositions and responsive rules. Discover gets a split artwork feature; detail pages get layered backdrops and explicit tracking panels; Dashboard gets compact task rows; collections get flat poster strips; profiles get a personal header and statistics rail; forms and legal pages get restrained reading widths.
- `media.css`: shared poster treatment extracted from the approved Home stylesheet. PosterCard now uses that presentation by default. Its link destination, metadata, image fallback and loading behavior are unchanged.
- `editorial.css`: approved Home composition and Home-only tokens. Keep future Home changes scoped here.

Existing JSX utility classes remain in place. The named hooks isolate presentation changes and avoid refactoring working data/interaction code. Some descendant selectors depend on existing component markup: inspect those rules when changing that markup.

## Motion

`PresentationMotion.tsx` is a DOM-only progressive enhancement mounted by AppShell. It observes media groups after lazy content arrives, then uses IntersectionObserver and the browser Web Animations API. Visible cards enter from opacity .9 / translateY(14px) / scale(.99), over 380ms, with 24ms stagger capped at 96ms. Content is never hidden pending an observer. Focus, preference changes and unmount finish/cancel animation and remove observers. Unsupported browsers render the content normally.

Home continues using HomeReveal. Utility pages skip the poster reveal system. Shared content entrances take 260ms from opacity .94; artwork settles over 720ms. Pointer hover reveals the poster affordance and subtly moves the artwork; keyboard focus shows the same affordance immediately. Existing native-dialog enter/exit handling and 150ms close timer are retained. CSS and JavaScript both respect reduced motion, including preference changes. No animation dependency was added.

## Functionality boundary

Do not put fetching, navigation, permission decisions or mutation state into styling/motion components. All API modules, authentication code, router definitions, data types, query client and utility functions are unchanged from the pre-extension baseline. Existing handlers, hook expressions, destinations and pending/disabled conditions were checked against that baseline. Dialog title/description association and error-state aria attributes improve semantics without changing validation or native-dialog behavior. Legal wording was preserved exactly, including existing content issues.

## Verification and review

Run `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run build` on Windows. For local review use `npm.cmd run dev -- --host 127.0.0.1`, then visit the existing routes with the normal backend configured.

Local review artifacts live in `docs/redesign/full/` (the repository already ignores `docs`). `review.html` pairs desktop/mobile before-and-after screenshots. `before/report.json` and `after/report.json` contain 21 route cases at 320, 390, 768, 1024 and 1440px. `interactions/report.json` records active browser checks and intercepted requests. `preservation.json` records source comparison findings. `bundle-comparison.json` records raw/gzip production assets. Capture helpers use an isolated Chrome CDP session and API fixtures; they do not exercise production backend writes.

Existing unit tests cover additional form validation, pagination, request handling, optimistic state and auth/redirect flows. Browser checks complement those tests; they are not exhaustive real-server or cross-browser end-to-end certification. Verify final artwork and permission edge cases against representative real accounts before release.
