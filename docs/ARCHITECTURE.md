# Architecture

## Flow and derived data

Pages/components call services. Services validate with Zod, check permissions/ownership, call pure utilities and update Zustand stores. Persistence adapters write to IndexedDB or the tiny localStorage allowlist. Some inherited layout controls still read UI/theme stores directly; business rules belong in services.

Reports, ledgers, calendar source layers, notifications, search, guide progress and profile stats are derived. Persist only source records, read/dismiss keys and preferences. Avoid a second stored financial total that can drift.

## Money and snapshots

New financial models use integer centavos. Legacy Phase 2–4 product/order/customer records retain pesos to preserve service contracts. Convert with toCentavos/fromCentavos at boundaries; formatMoney expects centavos, formatPHP expects pesos. Use existing quantity/rounding helpers.

Completed sales and payroll retain historical prices/costs/settings/staff snapshots. Editing today's settings must not recalculate old receipts or payroll. See ACCOUNTING.md.

## Permissions

RouteGuard protects navigation; Can hides actions; services enforce permissions and ownership independently. Search/notifications/calendar filter inside services. Own documents are manageable; other profiles require staff permissions and other document changes need documents:manage. System role migration adds Phase 8 grants; custom roles keep explicit grants.

Demo login is shared across tabs and is not a security boundary against the browser owner. No real authentication or multi-user chat exists.

## Storage lifecycle

HydrationGate finishes interrupted recovery, migrates legacy data, runs central migrations, hydrates all stores, seeds empty datasets, then starts sync/error/storage monitoring. Heavy records use tindapos:state IndexedDB; image/document blobs have separate databases. Auth, active branch, cart, theme/UI, guide and metadata stay tiny/synchronous.

Legacy migration verifies parsed equality before archiving the original key. Corrupt data is quarantined and opens Recovery rather than silently resetting. Safe write failures emit a persistent actionable notice instead of throwing into React.

Central registry entries specify store/from/to versions and wrap existing migrations. Snapshot before changes, keep the latest three. Restore verifies writes and uses a local journal to recover interrupted multi-backend restores. Snapshots exclude blob databases.

## Transactions and backup

localTransaction captures store states, batches heavy writes into one IndexedDB transaction and restores memory after synchronous workflow errors. Existing synchronous service APIs do not guarantee durable persistence immediately on return; async storage failures appear in StorageNotice.

Import validates all shapes/references before mutation, stages images, replaces related stores, waits for persistence and verifies read-back states. Verification failure restores previous records and deletes staged images. Phase 8 stores participate in rollback. Document upload stages a blob, verifies matching metadata, then deletes the replaced blob; failures compensate the new file.

Document JSON exports contain metadata only. Import marks them File missing; reset clears metadata/files. Keep separate document downloads. Backups and browser records are not encrypted.

## Sync, performance and PWA

BroadcastChannel tindapos carries keys/version timestamps. Receivers rehydrate business stores; auth/branch/cart/UI/theme are excluded. Last write wins. Matching marked edit forms get a record-change notice. Prefer one POS tab per branch.

Routes dynamically import screens. Chart wrappers defer React ApexCharts with core/line/bar/pie modules. Initial budgets include recursively shared imports. Fonts/icons are local. The PWA caches app assets, not external origins. A waiting worker requires an explicit Reload click and refuses while a cart/dialog is open.
