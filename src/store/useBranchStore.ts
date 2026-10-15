import { create } from "zustand";
export const branches = ["Main Branch", "Branch 2", "Head Office"] as const;
export type Branch = (typeof branches)[number];
export const useBranchStore = create<{
  branch: Branch;
  setBranch: (branch: Branch) => void;
}>((set) => ({
  branch: "Main Branch",
  setBranch: (branch) => set({ branch }),
}));
