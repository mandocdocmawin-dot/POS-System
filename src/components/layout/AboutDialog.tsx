import { Modal } from '../common/Modal';
import { version } from '../../../package.json';
export function AboutDialog({ open, close }: { open: boolean; close: () => void }) {
  return <Modal open={open} title="About TindaPOS" onClose={close}><div className="space-y-4"><h2 className="text-2xl font-bold">TindaPOS</h2><p>Version {version}</p><p>Built {__BUILD_DATE__} · Git {__GIT_HASH__}</p><p>A frontend-only POS demonstration. All business records stay in this browser. Email, chat, billing and support are simulated; no real messages or payments are sent.</p><p>Use Settings → General → Data to export a backup. One active POS tab per branch is recommended.</p></div></Modal>;
}
