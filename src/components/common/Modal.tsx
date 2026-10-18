/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- Native dialog backdrop clicks complement native Escape and the explicit Close button. */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
export function Modal({
  open,
  title,
  onClose,
  children,
  drawer = false,
  size = 'default',
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  drawer?: boolean;
  size?: 'default' | 'wide' | 'compact';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('input:not([type=checkbox]),textarea,select')?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`m-auto max-h-[90dvh] w-[calc(100%-2rem)] ${drawer?'max-w-xl':size==='wide'?'max-w-4xl':size==='compact'?'max-w-md':'max-w-2xl'} overflow-y-auto rounded-xl border border-slate-200 bg-white p-0 text-slate-700 shadow-xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${drawer ? "mr-0 h-dvh max-h-dvh rounded-r-none" : ""}`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          className="btn"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>,
    document.body,
  );
}
