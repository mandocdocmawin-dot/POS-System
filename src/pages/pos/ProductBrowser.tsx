import { useState } from "react";
import { LayoutGrid, Package, Search, Plus } from "lucide-react";
import { productService } from "../../services/productService";
import { categoryService, brandService } from "../../services/catalogService";
import { stockService } from "../../services/stockService";
import { useLocalData } from "../../services/useLocalData";
import { toast } from "../../services/toastService";
import { ProductImage } from "../../components/common/ProductImage";
import { formatPHP } from "../../utils/money";
export function ProductBrowser() {
  useLocalData();
  const [category, setCategory] = useState(""),
    [brand, setBrand] = useState(""),
    [search, setSearch] = useState("");
  const categories = categoryService
    .list()
    .filter((c) => c.status === "active");
  const products = productService.list().filter(
    (p) =>
      p.status === "active" &&
      (!category || p.categoryId === category) &&
      (!brand || p.brandId === brand) &&
      `${p.name} ${p.sku} ${p.barcode ?? ""} ${productService
        .variants(p.id)
        .map((v) => `${v.sku} ${v.barcode ?? ""}`)
        .join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="flex min-w-0 shrink-0 flex-col sm:flex-row xl:min-h-0 xl:flex-1">
      <nav
        aria-label="Product categories"
        className="flex shrink-0 gap-3 overflow-x-auto border-b border-slate-200 bg-white p-4 sm:w-28 sm:flex-col sm:border-b-0 sm:border-r xl:overflow-y-auto dark:border-slate-800 dark:bg-slate-900"
      >
        {[{ id: "", name: "All" }, ...categories].map((c) => {
          const Icon = c.id ? Package : LayoutGrid;
          return (
            <button
              key={c.id}
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`flex min-h-20 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border px-1 text-center text-xs ${category === c.id ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" : "border-slate-200 text-slate-500 dark:border-slate-700"}`}
            >
              <Icon size={23} strokeWidth={1.5} />
              {c.name}
            </button>
          );
        })}
      </nav>
      <main className="min-w-0 flex-1 p-4 md:p-6 xl:overflow-y-auto">
        <div className="mb-6 flex flex-wrap gap-3">
          <label className="relative min-w-40 flex-1">
            <span className="sr-only">Search by name, SKU or barcode</span>
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className="w-full pl-9"
              placeholder="Search name, SKU or barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">All brands</option>
            {brandService.list().map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            className="btn"
            onClick={() => {
              setCategory("");
              setBrand("");
              setSearch("");
            }}
          >
            Reset
          </button>
        </div>
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {categories.find((c) => c.id === category)?.name ?? "All Products"}
          </h1>
          <span className="text-xs text-slate-500">
            {products.length} products
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const stock = stockService.getStock(p.id);
            return (
              <article
                className={`card p-3 ${stock <= 0 ? "opacity-50" : ""}`}
                key={p.id}
              >
                <ProductImage imageId={p.imageId} name={p.name} large />
                <h2 className="mb-1 mt-3 truncate text-xs font-medium">
                  {p.name}
                </h2>
                <p className="text-xs text-slate-500">SKU: {p.sku}</p>
                {stock <= 0 ? (
                  <p className="mt-1 text-xs text-red-500">Out of stock</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    {stock} available
                    {p.hasVariants ? " · Variants available" : ""}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {formatPHP(p.sellingPrice)}
                  </span>
                  <button
                    disabled={stock <= 0}
                    aria-label={`Add ${p.name} (preview)`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white disabled:cursor-not-allowed"
                    onClick={() =>
                      toast.info("Cart functionality is planned for Phase 3.")
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {!products.length && (
          <div className="card py-12 text-center text-slate-500">
            No products match your filters.
          </div>
        )}
      </main>
    </div>
  );
}
