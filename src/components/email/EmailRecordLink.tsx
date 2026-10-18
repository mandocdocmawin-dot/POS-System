import { Link } from 'react-router-dom';
import { Can } from '../auth/Can';
export function EmailRecordLink({ type, id, label = 'Send email (demo)' }: { type: 'receipt' | 'payment-reminder' | 'purchase-order' | 'refund-confirmation'; id: string; label?: string }) {
  return <Can permission="email:use"><Link className="btn" to={`/email/mailbox?compose=${type}&record=${encodeURIComponent(id)}`}>{label}</Link></Can>;
}
