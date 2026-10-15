import { Link } from "react-router-dom";
import { CardHeading, PeriodSelect } from "../../components/common/CardHeading";
import { ChartPlaceholder } from "../../components/common/ChartPlaceholder";
import { ProductImage } from "../../components/common/ProductImage";
import { useLocalData } from "../../services/useLocalData";
import { DataTable } from "../../components/common/DataTable";
import { dashboardService } from "../../services/dashboardService";
export function ProductsRow() {
  useLocalData();
  const stock = dashboardService.getLowStock();
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
      <section className="card min-w-0 md:col-span-2 xl:col-span-5">
        <CardHeading title="Low Stock Items">
          <Link to="/inventory/stock-list" className="text-xs text-indigo-500">
            View All →
          </Link>
        </CardHeading>
        {!stock.length && (
          <p className="mt-4 text-xs text-slate-500">No low stock items.</p>
        )}
        <div className="-mx-5 mt-4">
          <DataTable
            caption="Low stock products"
            rows={stock}
            rowKey={(r) => r.sku}
            columns={[
              {
                id: "product",
                header: "Product",
                cell: (r) => (
                  <div className="flex items-center gap-2">
                    <ProductImage imageId={r.imageId} name={r.name} />
                    <div>
                      <span className="text-xs font-medium">{r.name}</span>
                      <p className="mt-1 text-xs text-red-400">
                        Reorder: {r.reorderLevel}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                id: "sku",
                header: "SKU",
                cell: (r) => (
                  <span className="text-xs text-slate-400">{r.sku}</span>
                ),
              },
              {
                id: "stock",
                header: "Stock",
                cell: (r) => (
                  <div className="flex items-center gap-2">
                    <div
                      role="progressbar"
                      aria-label={`${r.name} stock versus reorder level`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={r.percent}
                      className="h-1 w-12 rounded-full bg-slate-100 dark:bg-slate-800"
                    >
                      <div
                        style={{ width: `${r.percent}%` }}
                        className="h-full rounded-full bg-red-400"
                      />
                    </div>
                    <span className="text-xs">{r.stock}</span>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>
      <section className="card xl:col-span-4">
        <CardHeading title="Profit vs Sales">
          <PeriodSelect
            label="Profit versus sales period"
            options={["Monthly", "Weekly", "Yearly"]}
          />
        </CardHeading>
        <div className="mt-4 flex gap-4 text-xs text-slate-400">
          <span>
            <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Profit
          </span>
          <span>
            <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
            Sales
          </span>
        </div>
        <ChartPlaceholder height="h-48" />
      </section>
      <section className="card xl:col-span-3">
        <CardHeading title="Top Selling Products" />
        <p className="mt-2 text-xs text-slate-500">Demo sales numbers</p>
        <ul className="mt-5 space-y-5">
          {dashboardService.getTopProducts().map((p) => (
            <li key={p.sku} className="flex items-center gap-2.5">
              <ProductImage imageId={p.imageId} name={p.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">
                  {p.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {p.sku}{" "}
                  <span
                    className={`ml-1 ${p.up ? "text-emerald-500" : "text-red-400"}`}
                  >
                    {p.trend}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold">{p.sales}</p>
                <p className="mt-1 text-xs text-slate-400">sales</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
