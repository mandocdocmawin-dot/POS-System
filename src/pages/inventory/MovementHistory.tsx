import { T } from "../../i18n/T";
import {ProductImage} from '../../components/common/ProductImage';
import {Avatar} from '../../components/common/Avatar';
import {CatalogStatus} from '../../components/products/ProductWorkspace';
import {movementBalances} from '../../utils/movementBalances';
import {useStockStore} from '../../store/useStockStore';
import {exportCSV} from '../../utils/csv';
import {Download} from 'lucide-react';
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
  const [selected,setSelected]=useState<string[]>([]);
  const balances=movementBalances(useStockStore.getState().movements,branchService.activeId());
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
      <div className="product-panel-heading"><h2>{type==='in'?'Stock In List':type==='out'?'Stock Out List':type==='adjustment'?'Stock Adjustments':'Stock History'}</h2><button className="btn" onClick={()=>exportCSV('stock-movements.csv',[['Date','Product','Type','Quantity','Reason','Reference'],...rows.map(m=>[m.createdAt,products.find(p=>p.id===m.productId)?.name??'',m.type,m.type==='out'?-m.quantity:m.quantity,m.reason,m.reference??''])])}><Download size={15}/><T text={" Export CSV"}/></button></div>
      <div className="grid gap-3 p-5 sm:grid-cols-3">
        {!productId && (
          <Select
            label="Filter product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          >
            <option value=""><T text={"All products"}/></option>
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
        selection={selected}
        onSelectionChange={setSelected}
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
            cell: (m) => {const p=products.find(p=>p.id===m.productId);return <div className="flex items-center gap-3"><ProductImage name={p?.name??'Unavailable product'} imageId={p?.imageId}/><div className="font-semibold">{p?.name??'Unavailable product'}<p className="mt-1 text-xs font-normal text-slate-500">{variants.find(v=>v.id===m.variantId)?.name??p?.sku}</p></div></div>;},
          },
          { id: "type", header: "Type", cell: (m) => <CatalogStatus status={m.type==='adjustment'?(m.quantity>0?'Increase':'Decrease'):m.type}/> },
          {
            id: "quantity",
            header: "Quantity / delta",
            cell: (m) =>
              `${m.type === "out" ? "-" : m.quantity > 0 ? "+" : ""}${m.quantity}`,
            sortValue: (m) => m.quantity,
          },
          ...(type==='adjustment'?[{id:'before',header:'Before',cell:(m:StockMovement)=>balances.get(m.id)?.before??'—'},{id:'after',header:'After',cell:(m:StockMovement)=>balances.get(m.id)?.after??'—'}]:[]),
          { id: "reason", header: "Reason", cell: (m) => m.reason },
          {id:'status',header:'Status',cell:()=> <CatalogStatus status="Posted"/>},
          {
            id: "reference",
            header: "Reference",
            cell: (m) => m.reference || "—",
          },
          { id: "note", header: "Note", cell: (m) => m.note || "—" },
          { id: "by", header: "Created by", cell: (m) => <div className="flex items-center gap-2"><Avatar name={m.createdBy}/>{m.createdBy}</div> },
        ]}
      />
    </section>
  );
}
