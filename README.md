# TindaPOS

A frontend-only POS demo for Filipino shops. Phases 1–8 provide sales, inventory, people, accounts, reports and local work apps. Records stay in this browser. No backend, account server, analytics, real payments or message delivery.

## Quick start

Use Node.js 22.12+ (24 also works) and npm:

```sh
npm ci
npm run dev
```

Open Vite's printed URL. Keep the same hostname/port for the same browser data. `/landing` is public; `/` opens the app. Admin, Manager and Cashier quick logins are available on Sign In and Landing. Passwords are not verified. The user menu switches demo roles.

New development dependencies for an existing Phase 7 checkout:

```sh
npm install -D vite-plugin-pwa workbox-window @vite-pwa/assets-generator rollup-plugin-visualizer eslint-plugin-jsx-a11y fake-indexeddb
```

Inter is self-hosted using the runtime dependency `@fontsource/inter`. `.npmrc` uses legacy peer resolution because jsx-a11y's declared ESLint range trails the installed version; lint actually runs the plugin.

## Working modules

| Module | Local demo scope |
| --- | --- |
| POS | Search/barcodes, cart, discount/VAT, customers, hold/resume, split payments, credit, receipt printing |
| Catalog/inventory | Products/variants, categories/brands/units, local images, stock in/out/adjustment/history |
| Orders/customers | Invoices, refunds, balances, wallets, collections and activity |
| Purchasing | Suppliers, purchases/receiving, returns and payments |
| Staff | Demo roles, profiles, attendance, shifts, holidays and payroll snapshots |
| Accounts/reports | Derived ledgers, bank accounts, income/expenses/transfers, six reports, charts, CSV/print |
| Multi-store | Branches, scoped access, settings snapshots, coupons and stock transfers |
| Account/profile | Preferences, demo security, approval PIN, statements/logs, documents and notes |
| Work apps | Recurring/derived calendar, simulated email/templates/chat, tickets/contact/FAQ |
| Workspace | Search palette, notifications, activity, demo guide, landing, privacy/licenses and roadmap |
| Core/delivery | IndexedDB migration/recovery/sync, health/storage/errors/backup, offline PWA and hosting files |

Email saves locally to Sent; chat replies and support tickets are simulations. Billing collects nothing and plan limits are not enforced. No real card fields exist. Password/2FA/session controls are UI demonstrations; approval PINs are local demo controls.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Generate licenses and start Vite |
| `npm run typecheck` | Strict TypeScript checks |
| `npm run lint` | ESLint, React rules and JSX accessibility |
| `npm test` | Service, utility, storage and regression tests |
| `npm run build` | Licenses, TypeScript, bundle, PWA precache and SPA fallback |
| `npm run preview` | Production preview for PWA testing |
| `npm run analyze` | Ignored `.phase-tools/bundle.html` report |
| `npm run bundle-size` | Gzip limits: initial 250 KiB, route 120 KiB, charts/reports 200 KiB |
| `npm run external-urls` | Scan built text assets for unexpected URLs |
| `npm run check` | Typecheck → lint → tests → build → bundle budget → URL scan |

The URL scanner explicitly excludes bundled vendor diagnostic links and JSON Schema identifiers alongside W3C namespaces/Google Maps. These are not app network requests. This is a documented deviation from a literal W3C/Maps-only allowlist. ApexCharts licensing/pricing diagnostics remain intact.

## Persistence

Business records use IndexedDB. Tiny auth/active branch/open cart/theme/UI/guide/metadata use localStorage. Hydration finishes before rendering. Legacy business records are copied, read back and archived under `tindapos-legacy:`; archive cleanup requires confirmation. Settings → General → Data displays storage backends/sizes, browser quota/persistence, health checks, backups and recent errors.

JSON exports include Phase 8 data and image assets. **Document files are excluded; metadata only.** Imported documents show File missing and require re-upload. Download important files separately. Import validates before replacing records and verifies persistence. Reset seeds business records, clears document files and signs out. Recovery snapshots retain three persisted-state copies, excluding image/document blob databases.

Cross-tab updates use last-write-wins. Auth/branch/cart/UI/theme are excluded from broadcast rehydration. Use one POS tab per branch. Browser data can be evicted or cleared; persistent storage is best effort. Export backups regularly.

## Project map and documentation

`src/pages`/`components` render; `services` enforce workflows/permissions; `store` holds records; `core` handles storage/hydration/migrations/recovery/sync; `utils` calculates derived results; `config` defines routes/permissions/defaults; `data/seed` contains fixtures. `scripts` holds build checks.

Read [architecture](docs/ARCHITECTURE.md), [accounting](docs/ACCOUNTING.md), [deployment/offline](docs/DEPLOYMENT.md), [demo tours](docs/DEMO-SCRIPT.md), [manual testing](docs/TESTING.md), [all route statuses](docs/ROUTES.md), [release checks](docs/RELEASE-CHECKS.md) and [changelog](CHANGELOG.md).

## Limits and optional Phase 9

No real authentication, multi-user isolation, multi-device sync, email/chat/support delivery, billing, gateway, push or i18n. Browser owners can inspect/edit their data; role checks are demo behavior. Recurrence edits affect the entire series, with a 366-occurrence query cap. Dates use browser timezone. GitHub Pages cannot set arbitrary response headers.

Reviews, Print Barcode, Bulk Import/Export, Warranty, Batch Management, Lost Items, Alerts, Valuation and Warehouse remain optional inventory placeholders. Unused Components/Forms/Tables/Charts/Maps showcase sections have been removed. No later phase has started.

## Screenshot slots

Capture Dashboard light/dark, mobile POS, Calendar, Recovery and Landing after reviewing local records. Never publish personal staff files or backups in screenshots. See release checks for actual browser evidence.

## Demo account details

| Role | Seed email | Login |
| --- | --- | --- |
| Admin | admin@tindapos.demo | Admin quick-login button |
| Manager | manager@tindapos.demo | Manager quick-login button |
| Cashier | cashier@tindapos.demo | Cashier quick-login button |

Password entry is a UI demonstration and is not checked against a server. The public landing contact address is mandocdocmawin@gmail.com. Contact inquiries save as local tickets after demo sign-in; they are never emailed.

![TindaPOS landing](docs/screenshots/landing-desktop.png)
