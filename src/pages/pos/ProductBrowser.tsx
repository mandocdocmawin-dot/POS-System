import { useState } from "react";
import { LayoutGrid, Package, Search } from "lucide-react";
import { productService } from "../../services/productService";
import { categoryService, brandService } from "../../services/catalogService";
import { posService } from "../../services/posService";
import { ProductCard } from "../../components/pos/ProductCard";
import { useLocalData } from "../../services/useLocalData";
import { toast, errorMessage } from "../../services/toastService";
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
          {products.map(p=><ProductCard key={p.id} product={p} onAdd={()=>{try{posService.add(p.id);}catch(e){toast.error(errorMessage(e));}}}/>)}

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
