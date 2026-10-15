import { useToastStore } from "../store/useToastStore";
export const toast = {
  success: (m: string) => useToastStore.getState().add(m, "success"),
  error: (m: string) => useToastStore.getState().add(m, "error"),
  info: (m: string) => useToastStore.getState().add(m, "info"),
};
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred.";

export const useToasts = () => useToastStore((s) => s.items);
export const dismissToast = (id: string) =>
  useToastStore.getState().dismiss(id);
