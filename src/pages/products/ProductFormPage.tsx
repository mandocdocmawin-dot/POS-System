import { T } from "../../i18n/T";
import {ProductWorkspace} from '../../components/products/ProductWorkspace';
import {useSettings} from '../../hooks/useSettings';
import {
  productFormSchema,
  type ProductFormValues,
} from "../../components/forms/productSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { InlineVariants } from "./InlineVariants";
import { parseAttributes, attributesText } from "../../utils/attributes";
import { useRef, useState } from "react";
import {
  useBeforeUnload,
  useBlocker,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import {
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Switch,
} from "../../components/forms/Fields";
import { ImageUpload } from "../../components/forms/ImageUpload";
import { ProductImage } from "../../components/common/ProductImage";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { productService } from "../../services/productService";
import {
  categoryService,
  subcategoryService,
  brandService,
  unitService,
} from "../../services/catalogService";
import { imageService } from "../../services/imageService";
import { useLocalData } from "../../services/useLocalData";
import { toast, errorMessage } from "../../services/toastService";
import { generateSku } from "../../utils/id";
import { formatPHP } from "../../utils/money";
const defaults: ProductFormValues = {
  name: "",
  sku: "",
  barcode: "",
  categoryId: "",
  subcategoryId: "",
  brandId: "",
  unitId: "",
  costPrice: 0,
  sellingPrice: 0,
  taxRate: 12,
  discountPercent: 0,
  reorderLevel: 10,
  description: "",
  hasVariants: false,
  status: "active",
  openingStock: 0,
  variants: [],
};
export function Component() {
  const { id } = useParams();
  return <ProductForm key={id ?? "new"} id={id} />;
}
function ProductForm({ id }: { id?: string }) {
  useLocalData();
  const tax=useSettings(s=>s.tax),general=useSettings(s=>s.general);
  const current = id ? productService.get(id) : undefined;
  const navigate = useNavigate();
  const skip = useRef(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageKey, setImageKey] = useState(0);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...defaults,taxRateId:tax.rates.find(r=>r.isDefault)?.id,reorderLevel:general.lowStockDefaultReorder,
      ...current,
      variants: current
        ? productService.variants(current.id).map((v) => ({
            ...v,
            openingStock: 0,
            attributesText: attributesText(v.attributes),
          }))
        : [],
    },
  });
  const values = useWatch({ control });
  const dirty = isDirty || !!blob || imageBusy;
  useBeforeUnload((event) => {
    if (dirty && !skip.current) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  const blocker = useBlocker(() => dirty && !skip.current);
  const categories = categoryService.list(),
    subcategories = subcategoryService
      .list()
      .filter((s) => s.categoryId === values.categoryId),
    brands = brandService.list(),
    units = unitService.list();
  const effectivePrice =
    (values.sellingPrice ?? 0) * (1 - (values.discountPercent ?? 0) / 100);
  const profit = effectivePrice - (values.costPrice ?? 0);
  const margin = effectivePrice > 0 ? (profit / effectivePrice) * 100 : 0;
  async function save(v: ProductFormValues, another: boolean) {
    if (imageBusy) return;
    setError("");
    let newImage: string | undefined;
    try {
      if (blob) newImage = await imageService.save(blob);
      const { openingStock, variants, ...input } = v;
      productService.save(
        { ...input, id, imageId: newImage ?? current?.imageId },
        {
          openingStock,
          variants: v.hasVariants
            ? variants.map((variant) => ({
                id: variant.id,
                name: variant.name,
                sku: variant.sku,
                barcode: variant.barcode,
                costPrice: variant.costPrice,
                sellingPrice: variant.sellingPrice,
                attributes: parseAttributes(variant.attributesText),
              }))
            : [],
          variantOpening: Object.fromEntries(
            variants.map((x) => [x.sku, x.openingStock]),
          ),
        },
      );
      skip.current = true;
      toast.success(id ? "Product updated" : "Product added");
      setBlob(null);
      if (another && !id) {
        reset({...defaults,taxRateId:tax.rates.find(r=>r.isDefault)?.id,reorderLevel:general.lowStockDefaultReorder});
        setImageKey((k) => k + 1);
        skip.current = false;
        window.scrollTo({ top: 0 });
      } else navigate("/products");
    } catch (e) {
      if (newImage) void imageService.remove(newImage).catch(() => {});
      setError(errorMessage(e));
    }
  }
  if (id && !current)
    return (
      <section className="card">
        <h1><T text={"Product not found"}/></h1>
        <button className="btn mt-4" onClick={() => navigate("/products")}>
          Back to products
        </button>
      </section>
    );
  return (
    <ProductWorkspace title={id ? "Edit Product" : "Add Product"}>
      <form
        className="product-form"
        onSubmit={(event) => {
          void handleSubmit((v, e) =>
            save(
              v,
              (e?.nativeEvent as SubmitEvent).submitter?.getAttribute(
                "value",
              ) === "another",
            ),
          )(event);
        }}
      >
        <div className="product-form-main"><section className="card space-y-4">
          <h2 className="text-base font-semibold"><T text={"Product Information"}/></h2>
          <TextInput
            label="Product name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Textarea label="Description" rows={3} {...register("description")} />
          <div className="grid gap-4 sm:grid-cols-2"><div className="flex items-end gap-3">
            <div className="flex-1">
              <TextInput
                label="SKU"
                {...register("sku")}
                error={errors.sku?.message}
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={() =>
                setValue("sku", generateSku(), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            ><T text={"Generate"}/></button>
          </div>
          <TextInput
            label="Barcode"
            {...register("barcode")}
            error={errors.barcode?.message}
          /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              {...register("categoryId", {
                onChange: () =>
                  setValue("subcategoryId", "", { shouldDirty: true }),
              })}
              error={errors.categoryId?.message}
            >
              <option value=""><T text={"Choose category"}/></option>
              {categories
                .filter(
                  (c) => c.status === "active" || c.id === current?.categoryId,
                )
                .map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
            <Select
              label="Subcategory"
              {...register("subcategoryId")}
              disabled={!values.categoryId}
              error={errors.subcategoryId?.message}
            >
              <option value=""><T text={"None"}/></option>
              {subcategories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              label="Brand"
              {...register("brandId")}
              error={errors.brandId?.message}
            >
              <option value=""><T text={"None"}/></option>
              {brands.map((b) => (
                <option value={b.id} key={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
            <Select
              label="Unit"
              {...register("unitId")}
              error={errors.unitId?.message}
            >
              <option value=""><T text={"Choose unit"}/></option>
              {units.map((u) => (
                <option value={u.id} key={u.id}>
                  {u.name} ({u.shortName})
                </option>
              ))}
            </Select>
          </div>
        </section>
        <section className="card space-y-4">
          <h2 className="text-base font-semibold"><T text={"Pricing & Tax"}/></h2>
          <div className="grid gap-4 sm:grid-cols-2">
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
            <Select
              label="Tax rate"
              disabled={!tax.vatRegistered}
              {...register("taxRateId",{onChange:e=>setValue('taxRate',tax.rates.find(r=>r.id===e.target.value)?.rate??0,{shouldDirty:true})})}
            >
              <option value="">Legacy numeric rate ({current?.taxRate??12}%)</option>
              {tax.rates.filter(r=>r.status==='active'||r.id===current?.taxRateId).map(r=><option key={r.id} value={r.id}>{r.name} · {r.rate}%</option>)}
            </Select>
            <NumberInput
              label="Discount (%)"
              max={100}
              {...register("discountPercent", { valueAsNumber: true })}
              error={errors.discountPercent?.message}
            />
          </div>
          <p
            className="text-sm text-indigo-600 dark:text-indigo-300"
            aria-live="polite"
          >
            Profit: {formatPHP(profit)} · Margin: {margin.toFixed(1)}% after
            discount, before tax
          </p>
        </section>
        <section className="card space-y-4">
          <h2 className="text-base font-semibold"><T text={"Inventory"}/></h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {!id && !values.hasVariants && (
              <NumberInput
                label="Opening stock quantity"
                {...register("openingStock", { valueAsNumber: true })}
                error={errors.openingStock?.message}
              />
            )}
            <NumberInput
              label="Reorder level"
              {...register("reorderLevel", { valueAsNumber: true })}
              error={errors.reorderLevel?.message}
            />
          </div>
          {current?.hasVariants && (
            <p className="text-slate-500">
              Variant stock is managed individually in Inventory.
            </p>
          )}
        </section>
        <section className="card">
          <Switch label="Has variants" {...register("hasVariants")} />
        </section>
        {values.hasVariants && (
          <InlineVariants
            control={control}
            register={register}
            errors={errors}
            editing={!!id}
          />
        )}
        <section className="card space-y-4">
          <h2 className="text-base font-semibold"><T text={"Product Availability"}/></h2>
          <Switch
            label="Active product"
            checked={values.status === "active"}
            onChange={(e) =>
              setValue("status", e.target.checked ? "active" : "inactive", {
                shouldDirty: true,
              })
            }
          />
        </section>
        </div>
        <section className="card space-y-4 product-form-media">
          <h2 className="text-base font-semibold"><T text={"Product Images & Media"}/></h2>
          {current && !blob && (
            <div className="max-w-32">
              <ProductImage
                imageId={current.imageId}
                name={current.name}
                large
              />
            </div>
          )}
          <p className="text-xs text-slate-500">Upload a cover image for this product. JPEG, PNG and WebP are supported.</p>
          <ImageUpload
            visual
            key={imageKey}
            onChange={setBlob}
            onBusyChange={setImageBusy}
          />
        </section>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-500/15 dark:text-red-300"
          >
            {error}
          </p>
        )}
        <div className="product-form-footer flex flex-wrap justify-end gap-3">
          <button
            className="btn"
            type="button"
            onClick={() => navigate("/products")}
          ><T text={"Cancel"}/></button>
          {!id && (
            <button
              className="btn"
              disabled={isSubmitting || imageBusy}
              value="another"
            ><T text={"Save and add another"}/></button>
          )}
          <button className="btn-primary" disabled={isSubmitting || imageBusy}>
            {isSubmitting ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>
      {blocker.state === "blocked" && (
        <ConfirmDialog
          open
          title="Discard unsaved changes?"
          message="Your product changes have not been saved."
          onClose={() => blocker.reset()}
          onConfirm={() => blocker.proceed()}
        />
      )}
    </ProductWorkspace>
  );
}
