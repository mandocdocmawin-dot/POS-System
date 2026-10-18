# Deployment and production PWA acceptance

Files are prepared locally. No push, hosting project creation or deployment has been performed.

## Build/base path

Run npm ci, then npm run check. Serve dist. `.env.example` uses VITE_BASE=/. A project site needs both slashes: VITE_BASE=/POS-System/. Vite assets, router basename and relative manifest start/scope/shortcuts follow the base. Changing origin/profile creates a separate dataset.

Build generates licenses, assets, manifest/service worker, 404.html and .nojekyll. Analyze writes the ignored .phase-tools/bundle.html.

## Vercel

1. When you decide to publish, import the repository into Vercel.
2. Use Node 22+ and committed vercel.json: npm run check, output dist.
3. Set VITE_BASE=/ unless configuring a prefix.
4. Verify a direct deep link and response headers after publication.

## Netlify

1. When ready, create a repository-backed site or upload verified dist.
2. netlify.toml selects npm run check and dist; _redirects handles SPA routes.
3. _headers supplies security/cache rules. Check both index.html and a rewritten deep link.

## GitHub Pages

1. Choose Settings → Pages → Source: GitHub Actions.
2. Set Actions repository variable VITE_BASE=/your-repository/ (or / for a root/custom domain); workflow defaults to repository name.
3. Trigger Deploy GitHub Pages (manual) only when intending publication. It checks/builds, uploads and deploys; no push trigger is configured.
4. 404.html renders SPA routes on deep entry, potentially retaining HTTP 404. .nojekyll preserves underscore files.

GitHub Pages cannot set arbitrary response headers. Use a configurable host/proxy when the specified CSP/cache policy must be enforced. Header matching for subdirectory hosting must include that prefix.

## Headers

Vercel/Netlify: no-cache for /, index.html and sw.js; hashed assets immutable for one year; nosniff; no-referrer; camera/microphone/geolocation denied. CSP:

```text
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'
```

CSP is enforced by the real host, not vite preview. No third-party runtime cache is configured. Vendor diagnostic/schema strings retained by the URL scanner are documented in README.

## Offline/install/update

1. Run npm run build, then npm run preview -- --host 127.0.0.1 and open its exact URL.
2. DevTools → Application: verify manifest/icons/scope/worker and wait for precache. The worker is disabled in development.
3. Use User menu → Install app in a supporting browser, or its native install action. Safari uses Add to Home Screen. Availability belongs to the browser.
4. DevTools Application → Service Workers → Offline; reload. Navigate POS, Products, Orders, Reports, make a sample sale and inspect/print a receipt. Fonts and records must remain available.
5. Return online, build a changed app, reload the same origin and inspect the waiting-version banner. Nonempty cart/open dialog must block Reload. Hold/finish the cart, close dialogs and click Reload explicitly.
6. Check receipt/report/payslip/transfer/statement print preview, then the physical target printer separately.

Worker updates preserve business records. Clearing site data or uninstalling with data removal can delete them. Export first and test destructive flows in a disposable profile.
