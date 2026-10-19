import { T } from "../../i18n/T";
import {ProductWorkspace} from '../../components/products/ProductWorkspace';
import {ProductImage} from '../../components/common/ProductImage';
import {branchService} from '../../services/branchService';
import {Can} from '../../components/auth/Can';
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Variant } from "../../types/models";
import { variantFormSchema } from "../../components/forms/variantSchema";
import { TextInput, NumberInput, Select } from "../../components/forms/Fields";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageActions } from "../../components/common/PageActions";
import { productService } from "../../services/productService";
import { stockService } from "../../services/stockService";
import { useLocalData } from "../../services/useLocalData";
import { toast, errorMessage } from "../../services/toastService";
import { parseAttributes, attributesText } from "../../utils/attributes";
import { formatPHP } from "../../utils/money";
import { generateSku } from "../../utils/id";
const schema = variantFormSchema.extend({
  productId: z.string().min(1, "Choose a product"),
});
type Values = z.infer<typeof schema>;
function Editor({ item, done }: { item?: Variant; done: () => void }) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...item,
      productId: item?.productId ?? "",
      name: item?.name ?? "",
      sku: item?.sku ?? generateSku(),
      barcode: item?.barcode ?? "",
      costPrice: item?.costPrice ?? 0,
      sellingPrice: item?.sellingPrice ?? 0,
      openingStock: 0,
      attributesText: attributesText(item?.attributes ?? {}),
    },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((v) => {
        try {
          productService.saveVariant(v.productId, {
            id: item?.id,
            name: v.name,
            sku: v.sku,
            barcode: v.barcode,
            costPrice: v.costPrice,
            sellingPrice: v.sellingPrice,
            attributes: parseAttributes(v.attributesText),
          });
          toast.success("Variant saved");
          done();
        } catch (e) {
          setError(errorMessage(e));
        }
      })}
    >
      <Select
        label="Product"
        disabled={!!item}
        {...register("productId")}
        error={errors.productId?.message}
      >
        <option value=""><T text={"Choose product"}/></option>
        {productService.list().map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <TextInput
        label="Variant name"
        {...register("name")}
        error={errors.name?.message}
      />
      <TextInput label="SKU" {...register("sku")} error={errors.sku?.message} />
      <TextInput label="Barcode" {...register("barcode")} />
      <TextInput
        label="Attributes (Size: L, Color: Red)"
        {...register("attributesText")}
        error={errors.attributesText?.message}
      />
      <NumberInput
        label="Cost price (PHP)"
        {...register("costPrice", { valueAsNumber: true })}
        error={errors.costPrice?.message}
      />
      <NumberInput
        label="Selling price (PHP)"
        {...register("sellingPrice", { valueAsNumber: true })}
        error={errors.sellingPrice?.message}
      />
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
      <p className="text-xs text-slate-500">
        Products with existing stock movements cannot switch to variant
        tracking. Use the product form to create a product with variants.
      </p>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn" onClick={done}><T text={"Cancel"}/></button>
        <button className="btn-primary"><T text={"Save variant"}/></button>
      </div>
    </form>
  );
}
export function Component() {
  useLocalData();
  const [edit, setEdit] = useState<Variant | "new">();
  const [remove, setRemove] = useState<Variant>();
  const products = productService.list();
  return (
    <ProductWorkspace title="Variants">
      <PageActions title="Variants">
        <Can permission="products:create"><button className="btn-primary" onClick={() => setEdit("new")}><T text={"Add Variant"}/></button></Can>
      </PageActions>
      <section className="card p-0">
        <DataTable
          caption="Variants"
          rows={productService.variants()}
          rowKey={(v) => v.id}
          searchText={(v) =>
            `${products.find((p) => p.id === v.productId)?.name} ${v.name} ${v.sku}`
          }
          columns={[
            {
              id: "product",
              header: "Product",
              cell: (v) => {const p=products.find(p=>p.id===v.productId);return <div className="flex items-center gap-3"><ProductImage name={p?.name??v.name} imageId={p?.imageId}/>{p?.name??v.name}</div>;},
              sortValue: (v) =>
                products.find((p) => p.id === v.productId)?.name ?? "",
            },
            {
              id: "variant",
              header: "Variant",
              cell: (v) => (
                <div>
                  {v.name}
                  <p className="text-xs text-slate-500">
                    {attributesText(v.attributes)}
                  </p>
                </div>
              ),
              sortValue: (v) => v.name,
            },
            {
              id: "sku",
              header: "SKU",
              cell: (v) => v.sku,
              sortValue: (v) => v.sku,
            },
            {
              id: "price",
              header: "Price",
              cell: (v) => formatPHP(v.sellingPrice),
              sortValue: (v) => v.sellingPrice,
            },
            {
              id: "stock",
              header: "Stock",
              cell: (v) => stockService.getStock(v.productId, v.id,branchService.activeId()),
              sortValue: (v) => stockService.getStock(v.productId, v.id,branchService.activeId()),
            },
          ]}
          actions={(v) => (
            <div className="flex gap-3">
              <Can permission="products:edit"><button className="text-indigo-500" onClick={() => setEdit(v)}><T text={"Edit"}/></button></Can>
              <Can permission="products:delete"><button className="text-red-500" onClick={() => setRemove(v)}><T text={"Delete"}/></button></Can>
            </div>
          )}
        />
      </section>
      <Modal
        open={!!edit}
        title={edit === "new" ? "Add Variant" : "Edit Variant"}
        onClose={() => setEdit(undefined)}
      >
        {edit && (
          <Editor
            item={edit === "new" ? undefined : edit}
            done={() => setEdit(undefined)}
          />
        )}
      </Modal>
      {remove && (
        <ConfirmDialog
          open
          title="Delete variant?"
          message="Variants with stock history cannot be removed."
          onClose={() => setRemove(undefined)}
          onConfirm={() => {
            productService.removeVariant(remove.id);
            toast.success("Variant deleted");
          }}
        />
      )}
    </ProductWorkspace>
  );
}
