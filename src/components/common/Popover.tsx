/* eslint-disable jsx-a11y/no-noninteractive-element-interactions -- The dialog delegates native control clicks; its key handler supports Escape, Tab and arrow navigation. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
export function Popover({
  label,
  trigger,
  children,
  className = "",
  align = "right",
}: {
  label: string;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const triggerButton = button.current;
    panel.current?.querySelector<HTMLElement>('a,button,input,select,textarea')?.focus();
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !root.current?.contains(e.target))
        setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
      triggerButton?.focus();
    };
  }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const anchor = button.current?.getBoundingClientRect();
      const popup = panel.current;
      if (!anchor || !popup) return;
      const width = popup.getBoundingClientRect().width;
      const left = align === "right" ? anchor.right - width : anchor.left;
      popup.style.left = `${Math.max(12, Math.min(left, window.innerWidth - width - 12))}px`;
      popup.style.top = `${anchor.bottom + 8}px`;
      popup.style.maxHeight = `${Math.max(120, window.innerHeight - anchor.bottom - 20)}px`;
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, align]);
  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={className || "icon-btn"}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label={label}
          aria-modal="true"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a,button")) setOpen(false);
          }}
          onKeyDown={(e) => {
            if(e.key==='Tab'){
              const items=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a,button:not(:disabled),input:not(:disabled),select,textarea'));
              const first=items[0],last=items.at(-1);
              if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
              else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
            }
            if ((e.target as HTMLElement).matches("input,select,textarea")) return;
            if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
              const items = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>("a,button,input"),
              );
              const index = items.indexOf(
                document.activeElement as HTMLElement,
              );
              e.preventDefault();
              items[
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? items.length - 1
                    : (index +
                        (e.key === "ArrowDown" ? 1 : -1) +
                        items.length) %
                      items.length
              ]?.focus();
            }
          }}
          className={`fixed z-50 w-max overflow-y-auto max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900 `}
        >
          {children}
        </div>
      )}
    </div>
  );
}
