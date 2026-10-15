import { Drawer } from "../../components/common/Drawer";
import { ProductImage } from "../../components/common/ProductImage";
import { StockBadge } from "../../components/common/StockBadge";
import { productService } from "../../services/productService";
import {
  categoryService,
  subcategoryService,
  brandService,
  unitService,
} from "../../services/catalogService";
import { stockService } from "../../services/stockService";
import { formatPHP } from "../../utils/money";
import { formatDate } from "../../utils/date";
export function ProductDetails({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const p = productService.get(id);
  if (!p) return null;
  const details = {
    SKU: p.sku,
    Barcode: p.barcode ?? "—",
    Category: categoryService.list().find((c) => c.id === p.categoryId)?.name,
    Subcategory:
      subcategoryService.list().find((c) => c.id === p.subcategoryId)?.name ??
      "—",
    Brand: brandService.list().find((b) => b.id === p.brandId)?.name ?? "—",
    Unit: unitService.list().find((u) => u.id === p.unitId)?.name,
    Cost: formatPHP(p.costPrice),
    Price: formatPHP(p.sellingPrice),
    Tax: `${p.taxRate}%`,
    Discount: `${p.discountPercent ?? 0}%`,
    "Reorder level": p.reorderLevel,
    Stock: stockService.getStock(id),
    Status: p.status,
    Created: formatDate(p.createdAt),
    Updated: formatDate(p.updatedAt),
  };
  return (
    <Drawer open title={p.name} onClose={onClose}>
      <div className="mx-auto mb-5 max-w-40">
        <ProductImage imageId={p.imageId} name={p.name} large />
      </div>
      <StockBadge
        stock={stockService.getStock(id)}
        reorderLevel={p.reorderLevel}
      />
      <dl className="my-5 grid grid-cols-2 gap-x-4 gap-y-3">
        {Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs text-slate-500">{key}</dt>
            <dd className="mt-1 break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mb-5 whitespace-pre-wrap">
        {p.description || "No description."}
      </p>
      <h3 className="mb-3 font-semibold">Variants</h3>
      {productService.variants(id).map((v) => (
        <div
          className="mb-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
          key={v.id}
        >
          <p>
            {v.name} · {v.sku}
          </p>
          <p className="text-xs text-slate-500">
            {Object.entries(v.attributes)
              .map(([k, value]) => `${k}: ${value}`)
              .join(", ")}
          </p>
          <p className="mt-1">
            Cost {formatPHP(v.costPrice)} · Price {formatPHP(v.sellingPrice)} ·
            Stock {stockService.getStock(id, v.id)}
          </p>
        </div>
      ))}
      {!p.hasVariants && <p className="mb-5 text-slate-500">No variants.</p>}
      <h3 className="mb-3 font-semibold">Last 5 stock movements</h3>
      <ul className="space-y-3">
        {stockService
          .history(id)
          .slice(0, 5)
          .map((m) => (
            <li
              key={m.id}
              className="border-b border-slate-100 pb-3 dark:border-slate-800"
            >
              <p>
                {m.type} · {m.quantity} · {m.reason}
              </p>
              <p className="text-xs text-slate-500">
                {formatDate(m.createdAt)} · {m.createdBy}
                {m.variantId &&
                  ` · ${productService.variants(id).find((v) => v.id === m.variantId)?.name}`}
              </p>
              {m.reference && <p>Ref: {m.reference}</p>}
              {m.note && <p>{m.note}</p>}
            </li>
          ))}
      </ul>
      {!stockService.history(id).length && (
        <p className="text-slate-500">No stock movements.</p>
      )}
    </Drawer>
  );
}
