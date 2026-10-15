import { Eye, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { ProductThumb } from "../../components/common/ProductThumb";
import { Avatar } from "../../components/common/Avatar";
import { StatusBadge } from "../../components/common/StatusBadge";
import { dashboardService } from "../../services/dashboardService";
import { formatCurrency } from "../../types/format";
import type { LegacyOrder as Order } from "../../types/order";
export function RecentOrders() {
  const orders = dashboardService.getRecentOrders();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<{ order: Order; action: string } | null>(
    null,
  );
  const pageSize = 7;
  const pages = Math.ceil(orders.length / pageSize);
  const start = (page - 1) * pageSize;
  const visible = orders.slice(start, start + pageSize);
  const allSelected = visible.every((r) => selected.includes(r.id));
  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }
  return (
    <section className="card min-w-0 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-500/15">
            {orders.length} orders
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {selected.length
            ? `${selected.length} selected`
            : "Latest store activity"}
        </span>
      </div>
      <DataTable
        caption="Recent store orders"
        rows={visible}
        rowKey={(row) => row.id}
        columns={[
          {
            id: "select",
            header: (
              <input
                type="checkbox"
                aria-label="Select all orders on this page"
                checked={allSelected}
                onChange={() =>
                  setSelected((s) =>
                    allSelected
                      ? s.filter((id) => !visible.some((r) => r.id === id))
                      : [...new Set([...s, ...visible.map((r) => r.id)])],
                  )
                }
              />
            ),
            cell: (row) => (
              <input
                type="checkbox"
                aria-label={`Select ${row.id}`}
                checked={selected.includes(row.id)}
                onChange={() => toggle(row.id)}
              />
            ),
          },
          {
            id: "id",
            header: "Order ID",
            cell: (r) => (
              <button
                onClick={() => setDetail({ order: r, action: "View" })}
                className="font-medium text-indigo-500"
              >
                {r.id}
              </button>
            ),
          },
          {
            id: "date",
            header: "Date",
            cell: (r) => (
              <span className="text-xs text-slate-500">{r.date}</span>
            ),
          },
          {
            id: "product",
            header: "Product",
            cell: (r) => (
              <div className="flex items-center gap-2">
                <ProductThumb />
                <span className="text-xs">{r.product}</span>
              </div>
            ),
          },
          {
            id: "customer",
            header: "Customer",
            cell: (r) => (
              <div className="flex items-center gap-2">
                <Avatar name={r.customer} />
                <span className="text-xs">{r.customer}</span>
              </div>
            ),
          },
          { id: "items", header: "Items", cell: (r) => r.items },
          {
            id: "price",
            header: "Total Price",
            cell: (r) => (
              <span className="font-medium">{formatCurrency(r.total)}</span>
            ),
          },
          {
            id: "payment",
            header: "Payment Status",
            cell: (r) => <StatusBadge>{r.paymentStatus}</StatusBadge>,
          },
          { id: "quantity", header: "Quantity", cell: (r) => r.quantity },
          {
            id: "status",
            header: "Order Status",
            cell: (r) => <StatusBadge>{r.status}</StatusBadge>,
          },
          {
            id: "actions",
            header: "Actions",
            cell: (r) => (
              <div className="flex gap-1">
                {[
                  { label: "View", icon: Eye },
                  { label: "Edit", icon: Pencil },
                  { label: "Delete", icon: Trash2 },
                ].map(({ label, icon: Icon }) => (
                  <button
                    className={`rounded border border-slate-200 p-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 ${label === "Delete" ? "text-red-400" : "text-slate-400"}`}
                    key={label}
                    aria-label={`${label} ${r.id}`}
                    onClick={() => setDetail({ order: r, action: label })}
                  >
                    <Icon size={12} />
                  </button>
                ))}
              </div>
            ),
          },
        ]}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
        <p className="text-xs text-slate-400">
          Showing {start + 1}-{Math.min(start + pageSize, orders.length)} of{" "}
          {orders.length} Results
        </p>
        <nav aria-label="Orders pagination" className="flex gap-1">
          <button
            className="btn min-h-7 px-2 text-xs disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              aria-label={`Page ${i + 1}`}
              aria-current={page === i + 1 ? "page" : undefined}
              className={`h-7 w-7 rounded text-xs ${page === i + 1 ? "bg-indigo-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn min-h-7 px-2 text-xs disabled:opacity-40"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </nav>
      </div>
      {detail && (
        <div
          className="border-t border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900 dark:bg-indigo-500/10"
          role="status"
        >
          <div className="flex justify-between">
            <p className="text-xs font-medium">
              {detail.action} {detail.order.id}
            </p>
            <button
              aria-label="Close order preview"
              onClick={() => setDetail(null)}
            >
              <X size={15} />
            </button>
          </div>
          <p className="mt-2 text-xs">
            {detail.order.customer} · {detail.order.product} ·{" "}
            {formatCurrency(detail.order.total)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {detail.action === "View"
              ? "Static order preview. Full order details are planned for a later phase."
              : `${detail.action} is a UI preview only. No records are changed in Phase 1.`}
          </p>
        </div>
      )}
    </section>
  );
}
