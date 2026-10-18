import {ManagerApprovalRequired} from '../../services/approvalService';
import {ApprovalDialog} from '../approvals/ApprovalDialog';
import { useState } from "react";
import { Modal } from "./Modal";
export function ConfirmDialog({
  open,
  title,
  message,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [approval,setApproval]=useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <> <Modal
      open={open}
      title={title}
      onClose={() => {
        if (!busy) {
          setError("");
          onClose();
        }
      }}
    >
      <p className="mb-5 whitespace-pre-line">{message}</p>
      {error && (
        <p role="alert" className="mb-4 text-red-500">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button className="btn" disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await onConfirm();
              onClose();
            } catch (e) {
              const cause=e instanceof Error&&e.cause instanceof Error?e.cause:e;
              if(cause instanceof ManagerApprovalRequired){setApproval(cause.scope);return;}
              setError(
                e instanceof Error
                  ? e.message
                  : "Could not complete the action.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>{approval&&<ApprovalDialog scope={approval} onClose={()=>setApproval(undefined)} onApproved={async()=>{await onConfirm();onClose();}}/>}</>
  );
}
