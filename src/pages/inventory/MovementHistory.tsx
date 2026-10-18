import {branchService} from '../../services/branchService';
import { localDate } from "../../utils/date";
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { Select, TextInput } from "../../components/forms/Fields";
import { stockService } from "../../services/stockService";
import { productService } from "../../services/productService";
import { formatDate } from "../../utils/date";
import type { StockMovement } from "../../types/models";
export function MovementHistory({
  type,
  productId,
  variantId,
}: {
  type?: StockMovement["type"];
  productId?: string;
  variantId?: string;
}) {
  const [product, setProduct] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const products = productService.list();
  const variants = productService.variants();
  const rows = stockService
    .history(productId || product || undefined, variantId,branchService.activeId())
    .filter(
      (m) =>
        (!type || m.type === type) &&
        (!from || localDate(new Date(m.createdAt)) >= from) &&
        (!to || localDate(new Date(m.createdAt)) <= to),
    );
  return (
    <section className="card p-0">
      <h2 className="px-5 pt-5 font-semibold">Stock history</h2>
      <div className="grid gap-3 p-5 sm:grid-cols-3">
        {!productId && (
          <Select
            label="Filter product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          >
            <option value="">All products</option>
            {products.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        )}
        <TextInput
          label="From date"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <TextInput
          label="To date"
          type="date"
          value={to}
          min={from}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      {from && to && from > to && (
        <p role="alert" className="px-5 text-red-500">
          End date must be on or after start date.
        </p>
      )}
      <DataTable
        caption="Stock movements"
        rows={rows}
        rowKey={(m) => m.id}
        searchText={(m) =>
          `${products.find((p) => p.id === m.productId)?.name} ${m.reason} ${m.reference ?? ""} ${m.note ?? ""}`
        }
        columns={[
          {
            id: "date",
            header: "Date",
            cell: (m) => formatDate(m.createdAt),
            sortValue: (m) => m.createdAt,
          },
          {
            id: "product",
            header: "Product / variant",
            cell: (m) => (
              <div>
                {products.find((p) => p.id === m.productId)?.name}
                <p className="text-xs text-slate-500">
                  {variants.find((v) => v.id === m.variantId)?.name}
                </p>
              </div>
            ),
          },
          { id: "type", header: "Type", cell: (m) => m.type },
          {
            id: "quantity",
            header: "Quantity / delta",
            cell: (m) =>
              `${m.type === "out" ? "-" : m.quantity > 0 ? "+" : ""}${m.quantity}`,
            sortValue: (m) => m.quantity,
          },
          { id: "reason", header: "Reason", cell: (m) => m.reason },
          {
            id: "reference",
            header: "Reference",
            cell: (m) => m.reference || "—",
          },
          { id: "note", header: "Note", cell: (m) => m.note || "—" },
          { id: "by", header: "Created by", cell: (m) => m.createdBy },
        ]}
      />
    </section>
  );
}
