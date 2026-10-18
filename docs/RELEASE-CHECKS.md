# Phase 8 release checks

Checked locally on 2026-10-18. No push or deployment was performed.

## Automated and browser evidence

- TypeScript and ESLint (including jsx-a11y) pass without errors or warnings.
- Vitest: 386 tests in 29 files pass, including earlier-phase financial consistency and new landing contact validation/ownership checks.
- Production builds generate the manifest, icons, local fonts, service worker and SPA fallback. WebP landing assets are precached.
- Initial JavaScript is approximately 216 KiB gzip against the 250 KiB budget. The modular chart chunk remains under 200 KiB; all other route chunks remain under 120 KiB.
- Analyze writes the ignored .phase-tools/bundle.html report.
- Built URL scan passes with explicit vendor diagnostic/schema exceptions. This differs from the originally requested literal W3C/Maps-only allowlist; these exceptions do not add application network requests.
- 89 distinct non-record screens were loaded at 360/768/1024/1440 pixels with no persistent page-level horizontal overflow. Route aliases/dynamic record routes are covered by the manual checklist, not claimed as separate viewport runs.
- All 89 screens were scanned for text contrast in both themes. Shared secondary labels, status colors, buttons and landing colors were corrected; affected screens were rechecked. This computed-style scan is not an axe/Lighthouse certificate.
- The final landing follows the supplied section/layout references with TindaPOS indigo/teal branding. Verified: sticky navigation, Live Preview globe → /landing, monthly/yearly pricing, FAQ accordion, testimonial controls, mobile menu, light/dark colors and mailto:mandocdocmawin@gmail.com.
- Full structured evidence: [browser-audit.json](browser-audit.json). Screenshots: [desktop](screenshots/landing-desktop.png), [mobile](screenshots/landing-mobile.png), [contact email](screenshots/landing-contact-mobile.png), [full page](screenshots/landing-full.png).

## Target-environment checks still manual

The in-app browser controls do not expose DevTools offline/install/update controls, a physical printer or a deployed host. Follow TESTING.md and DEPLOYMENT.md for PWA installation, actual offline reload/sale, a waiting-worker update, all print previews/physical output and host-enforced CSP/cache headers. No claim is made that these manual steps were executed.

GitHub Pages cannot supply arbitrary response headers; Vercel and Netlify configurations are prepared. No hosting account was modified.

## Landing review

Reference-directed build: preserve the supplied page composition, use TindaPOS colors and truthful local-demo copy. Local generated photos and custom SVGs replace reference stock assets. Repeated service/pricing cards and section labels intentionally follow the user's reference, overriding the earlier house-style direction.

ROUND 2
Seen in one second: a POS workspace headline over a full-width business photo.
Idea: a familiar business landing page introduces TindaPOS's connected local shop workspace.
Live thing: pricing period switch, FAQ accordion, testimonial navigation and demo-role entry.
Layouts: hero=full-width photo / highlights=four columns / about=illustrated split / facts=band / benefits=photo split / services=grid / pricing=three columns / FAQ=illustrated split / demo stories=cards / CTA=band / contact=split / footer=columns.
Self-review scores: design 7 · usability 8 · creativity 6 · content 8 → weighted 7.2. House-rubric cap: 6.5 for reference-requested labels/card repetition and fewer than four photos. These are deliberate reference constraints, not unresolved layout failures.
Remaining tradeoffs: two generated photos rather than the reference's stock-photo library; testimonials are explicitly illustrative; contact inquiries require demo sign-in and save locally rather than delivering email.

The skill's standalone inspector was not run because browser interaction used the supported in-app browser workflow. Actual screenshots, computed colors and overflow measurements were reviewed instead.

## Base-path production check

Built with VITE_BASE=/tindapos-test/ and served with vite preview at that prefix. Verified generated asset/theme URLs, relative manifest start/scope/shortcuts, 404.html/.nojekyll, production landing rendering, Admin demo login and Live Preview linking to /tindapos-test/landing. Production browser error/warning log was empty during this check. The final check rebuilds the normal root-base output.

## Dependency audit note

A separate `npm audit --omit=dev` check reports two moderate React Router package advisories (react-router and its react-router-dom parent). npm proposes a major upgrade to v7.18.4. This project deliberately remains on the requested React Router v6, so a breaking router migration was not included in Phase 8. The reported issues concern backslash URL redirects and SSR hydration; this app uses fixed internal route construction and has no SSR runtime. This is a recorded limitation, not a clean security-audit claim. The required npm run check suite does not include npm audit.
