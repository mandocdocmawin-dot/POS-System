import { useState } from "react";
import {
  LayoutGrid,
  Shirt,
  Footprints,
  Watch,
  Coffee,
  Glasses,
  Headphones,
  Backpack,
  SlidersHorizontal,
  ScanBarcode,
  Search,
  Plus,
  Check,
} from "lucide-react";
import { productService } from "../../services/productService";
import { ProductThumb } from "../../components/common/ProductThumb";
import { Popover } from "../../components/common/Popover";
import { formatCurrency } from "../../types/format";
const icons = {
  all: LayoutGrid,
  clothing: Shirt,
  footwear: Footprints,
  watches: Watch,
  food: Coffee,
  accessories: Glasses,
  electronics: Headphones,
  bags: Backpack,
};
export function ProductBrowser() {
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All Brands");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const categories = productService.getCategories();
  const products = productService
    .getProducts()
    .filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (brand === "All Brands" || p.brand === brand) &&
        `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase()),
    );
  return (
    <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
      <nav
        aria-label="Product categories"
        className="flex shrink-0 gap-3 overflow-x-auto border-b border-slate-200 bg-white p-4 sm:w-[110px] sm:flex-col sm:border-b-0 sm:border-r dark:border-slate-800 dark:bg-slate-900"
      >
        {categories.map((c) => {
          const Icon = icons[c.icon];
          return (
            <button
              key={c.name}
              aria-pressed={category === c.name}
              onClick={() => setCategory(c.name)}
              className={`flex min-h-20 w-[78px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border text-xs ${category === c.name ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" : "border-slate-200 text-slate-400 hover:border-indigo-300 dark:border-slate-700"}`}
            >
              <Icon size={23} strokeWidth={1.5} />
              {c.name}
            </button>
          );
        })}
      </nav>
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Popover
            label="Filter products"
            align="left"
            className="btn"
            trigger={
              <>
                <SlidersHorizontal size={15} />
                Filter
              </>
            }
          >
            <div className="w-48 p-2">
              <label className="mb-2 block text-xs" htmlFor="category-filter">
                Category
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full"
              >
                {categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
              <button
                className="mt-3 text-xs text-indigo-500"
                onClick={() => {
                  setCategory("All");
                  setBrand("All Brands");
                  setSearch("");
                }}
              >
                Reset filters
              </button>
            </div>
          </Popover>
          <Popover
            label="Choose product brand"
            align="left"
            className="btn-primary"
            trigger={brand === "All Brands" ? "View All Brands" : brand}
          >
            <div className="w-44">
              {["All Brands", ...productService.getBrands()].map((b) => (
                <button
                  className="flex w-full items-center justify-between rounded-lg p-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  key={b}
                  onClick={() => setBrand(b)}
                >
                  {b}
                  {brand === b && <Check size={14} />}
                </button>
              ))}
            </div>
          </Popover>
          <div className="relative min-w-36 flex-1">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              aria-label="Search product"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          <button
            aria-label="Scan barcode"
            className="icon-btn"
            onClick={() =>
              setNotice("Barcode scanning is planned for a later phase.")
            }
          >
            <ScanBarcode size={19} />
          </button>
        </div>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {category === "All" ? "All Products" : category}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Find something your customer will love.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {products.length} products
          </span>
        </div>
        {notice && (
          <div
            role="status"
            className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
          >
            {notice}
            <button
              onClick={() => setNotice("")}
              className="font-semibold"
              aria-label="Dismiss product notice"
            >
              ×
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <article className="card p-3" key={p.id}>
              <ProductThumb large />
              <h2 className="mb-1 mt-3 truncate text-xs font-medium">
                {p.name}
              </h2>
              <p className="text-xs text-slate-400">SKU: {p.sku}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(p.price)}
                </span>
                <button
                  aria-label={`Add ${p.name} (preview)`}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() =>
                    setNotice(
                      `${p.name}: cart functionality is planned for a later phase.`,
                    )
                  }
                >
                  <Plus size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {products.length === 0 && (
          <div className="card py-12 text-center text-slate-400">
            No products match your filters.
          </div>
        )}
      </main>
    </div>
  );
}
