import {stockService} from '../../services/stockService';
import {Modal} from '../../components/common/Modal';
import type {Product} from '../../types/models';
import {VariantPicker} from '../../components/pos/VariantPicker';
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
  const [brandModal,setBrandModal]=useState(false),[filterModal,setFilterModal]=useState(false),[stockOnly,setStockOnly]=useState(false);
  const [variantProduct,setVariantProduct]=useState<Product|null>(null);
  const add=(p:Product,variantId?:string)=>{if(p.hasVariants&&!variantId){setVariantProduct(p);return;}try{posService.add(p.id,variantId);setVariantProduct(null);requestAnimationFrame(()=>document.getElementById('pos-search')?.focus());}catch(e){toast.error(errorMessage(e));}};
  const focusSearch=()=>requestAnimationFrame(()=>{if(!document.querySelector('dialog[open]'))document.getElementById('pos-search')?.focus();});
  const scan=()=>{const query=search.trim().toLowerCase();if(!query)return;for(const p of productService.list().filter(p=>p.status==='active')){const v=productService.variants(p.id).find(v=>v.sku.toLowerCase()===query||v.barcode?.toLowerCase()===query);if(v||p.sku.toLowerCase()===query||p.barcode?.toLowerCase()===query){add(p,v?.id);setSearch('');focusSearch();return;}}toast.error('No exact barcode or SKU match.');};
  const categories = categoryService
    .list()
    .filter((c) => c.status === "active");
  const products = productService.list().filter(
    (p) =>
      p.status === "active" &&
      (!category || p.categoryId === category) &&
      (!brand || p.brandId === brand) &&
      (!stockOnly || stockService.getStock(p.id)>0) &&
      `${p.name} ${p.sku} ${p.barcode ?? ""} ${productService
        .variants(p.id)
        .map((v) => `${v.sku} ${v.barcode ?? ""}`)
        .join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <><Modal open={brandModal} title="View All Brands" onClose={()=>{setBrandModal(false);focusSearch();}}><div className="flex flex-wrap gap-2">{[{id:'',name:'All brands'},...brandService.list().filter(b=>b.status==='active')].map(b=><button className="btn" aria-pressed={brand===b.id} key={b.id} onClick={()=>{setBrand(b.id);setBrandModal(false);focusSearch();}}>{b.name}</button>)}</div></Modal>
    <Modal open={filterModal} title="Filter products" onClose={()=>{setFilterModal(false);focusSearch();}}><label className="flex gap-3"><input type="checkbox" checked={stockOnly} onChange={e=>setStockOnly(e.target.checked)}/>In-stock products only</label><button className="btn-primary mt-5" onClick={()=>{setFilterModal(false);focusSearch();}}>Apply filters</button></Modal><VariantPicker product={variantProduct} onClose={()=>setVariantProduct(null)} onChoose={id=>variantProduct&&add(variantProduct,id)}/><div className="flex w-full min-w-0 flex-col sm:flex-row md:min-h-0 md:flex-1">
      <nav
        aria-label="Product categories"
        className="flex shrink-0 gap-3 overflow-x-auto border-b border-slate-200 bg-white p-4 sm:w-28 sm:flex-col sm:border-b-0 sm:border-r md:overflow-y-auto dark:border-slate-800 dark:bg-slate-900"
      >
        {[{ id: "", name: "All" }, ...categories].map((c) => {
          const Icon = c.id ? Package : LayoutGrid;
          return (
            <button
              key={c.id}
              aria-pressed={category === c.id}
              onClick={() => {setCategory(c.id);focusSearch();}}
              className={`flex min-h-20 w-20 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border px-1 text-center text-xs ${category === c.id ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" : "border-slate-200 text-slate-500 dark:border-slate-700"}`}
            >
              <Icon size={23} strokeWidth={1.5} />
              {c.name}
            </button>
          );
        })}
      </nav>
      <main className="min-w-0 flex-1 p-4 md:p-6 md:overflow-y-auto">
        <div className="mb-6 flex flex-wrap gap-3">
          <label className="relative min-w-40 flex-1">
            <span className="sr-only">Search by name, SKU or barcode</span>
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              id="pos-search" autoFocus onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();scan();}}}
              className="w-full pl-9"
              placeholder="Search name, SKU or barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button className="btn" onClick={()=>setBrandModal(true)}>View All Brands{brand?' •':''}</button><button className="btn" onClick={()=>setFilterModal(true)}>Filter{stockOnly?' •':''}</button>
          <button
            className="btn"
            onClick={() => {
              setCategory("");
              setBrand("");
              setSearch("");setStockOnly(false);focusSearch();
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
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map(p=><ProductCard key={p.id} product={p} onAdd={()=>add(p)}/>)}

        </div>
        {!products.length && (
          <div className="card py-12 text-center text-slate-500">
            No products match your filters.
          </div>
        )}
      </main>
    </div></>
  );
}

