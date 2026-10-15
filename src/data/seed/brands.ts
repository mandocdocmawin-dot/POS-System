import type { Brand } from "../../types/models";
export const brands: Brand[] = [
  "Generic",
  "Century",
  "Nestlé",
  "Universal Robina",
  "Unilever",
  "Procter & Gamble",
  "Datu Puti",
  "Alaska",
].map((name, i) => ({
  id: `brand-${i}`,
  name,
  status: "active",
  createdAt: "2025-12-19T08:00:00.000Z",
}));
