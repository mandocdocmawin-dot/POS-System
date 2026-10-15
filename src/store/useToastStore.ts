import { create } from "zustand";
type ToastKind = "success" | "error" | "info";
interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}
export const useToastStore = create<{
  items: Toast[];
  add: (message: string, kind: ToastKind) => void;
  dismiss: (id: string) => void;
}>((set, get) => ({
  items: [],
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
  add: (message, kind) => {
    const id = crypto.randomUUID();
    set((s) => ({ items: [...s.items, { id, kind, message }] }));
    setTimeout(() => get().dismiss(id), 5000);
  },
}));
