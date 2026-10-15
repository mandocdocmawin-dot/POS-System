import {
  Receipt,
  PackagePlus,
  UserPlus,
  Users,
  Truck,
  Boxes,
  ShoppingBag,
  Wallet,
  Mail,
  Ticket,
  Coins,
  MessagesSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { routes } from "./menu";
interface QuickAction {
  label: string;
  icon: LucideIcon;
  path: string;
}
const definitions: [string, LucideIcon, string][] = [
  ["Invoice", Receipt, "/orders/invoices"],
  ["Add Product", PackagePlus, "/products/add-product"],
  ["New Staff", UserPlus, "/staff/add-staff"],
  ["New Customer", Users, "/customers/add-customer"],
  ["Add Supplier", Truck, "/suppliers/add-supplier"],
  ["Inventory", Boxes, "/inventory/stock-list"],
  ["Order", ShoppingBag, "/orders/all-orders"],
  ["Payment", Wallet, "/purchases/payments"],
  ["Send Email", Mail, "/email/mailbox"],
  ["Coupons", Ticket, "/settings/coupons"],
  ["Currencies", Coins, "/settings/currencies"],
  ["Create Chat", MessagesSquare, "/chat/default"],
];
export const quickActions: QuickAction[] = definitions.map(
  ([label, icon, path]) => {
    if (!routes.some((route) => route.path === path))
      throw new Error(`Unknown quick action: ${path}`);
    return { label, icon, path };
  },
);
