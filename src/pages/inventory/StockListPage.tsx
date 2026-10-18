import {branchService} from '../../services/branchService';
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { PageActions } from "../../components/common/PageActions";
import { StockBadge } from "../../components/common/StockBadge";
import { Drawer } from "../../components/common/Drawer";
import { stockService } from "../../services/stockService";
import { useLocalData } from "../../services/useLocalData";
import { formatPHP } from "../../utils/money";
import { MovementHistory } from "./MovementHistory";
type Item = ReturnType<typeof stockService.items>[number];
export function Component() {
  useLocalData();
  const [view, setView] = useState<Item>();
  const rows = stockService.items(branchService.activeId());
  const summary = {
    "Total items": rows.length,
    "Total stock value": formatPHP(
      rows.reduce((s, r) => s + r.stock * r.cost, 0),
    ),
    "Low stock": rows.filter(
      (r) => r.stock > 0 && r.stock <= r.product.reorderLevel,
    ).length,
    "Out of stock": rows.filter((r) => r.stock <= 0).length,
  };
  return (
    <>
      <p className="mb-4 rounded-lg border border-indigo-200 p-3 text-sm dark:border-indigo-800">Active branch: <strong>{branchService.get(branchService.activeId())?.name}</strong></p>
      <PageActions title="Stock List" />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(summary).map(([label, value]) => (
          <section className="card" key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </section>
        ))}
      </div>
      <section className="card p-0">
        <DataTable
          caption="Stock items"
          rows={rows}
          rowKey={(r) => r.key}
          searchText={(r) => `${r.name} ${r.sku} ${r.category}`}
          columns={[
            {
              id: "name",
              header: "Product / variant",
              cell: (r) => r.name,
              sortValue: (r) => r.name,
            },
            {
              id: "sku",
              header: "SKU",
              cell: (r) => r.sku,
              sortValue: (r) => r.sku,
            },
            {
              id: "category",
              header: "Category",
              cell: (r) => r.category,
              sortValue: (r) => r.category,
            },
            {
              id: "stock",
              header: "Current stock",
              cell: (r) => r.stock,
              sortValue: (r) => r.stock,
            },
            {
              id: "reorder",
              header: "Reorder level",
              cell: (r) => r.product.reorderLevel,
              sortValue: (r) => r.product.reorderLevel,
            },
            {
              id: "value",
              header: "Stock value",
              cell: (r) => formatPHP(r.stock * r.cost),
              sortValue: (r) => r.stock * r.cost,
            },
            {
              id: "status",
              header: "Stock status",
              cell: (r) => (
                <StockBadge
                  stock={r.stock}
                  reorderLevel={r.product.reorderLevel}
                />
              ),
            },
          ]}
          actions={(r) => (
            <button className="text-indigo-500" onClick={() => setView(r)}>
              View history
            </button>
          )}
        />
      </section>
      {view && (
        <Drawer open title={view.name} onClose={() => setView(undefined)}>
          <MovementHistory
            productId={view.product.id}
            variantId={view.variant?.id}
          />
        </Drawer>
      )}
    </>
  );
}
