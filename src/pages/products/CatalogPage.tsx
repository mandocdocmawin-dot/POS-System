import { T } from "../../i18n/T";
import {ProductWorkspace,CatalogStatus} from '../../components/products/ProductWorkspace';
import {ProductImage} from '../../components/common/ProductImage';
import {Popover} from '../../components/common/Popover';
import {productService} from '../../services/productService';
import {Layers,CheckCircle2,XCircle,Package,MoreVertical,Pencil,Trash2,Plus} from 'lucide-react';
import {Can} from '../../components/auth/Can';
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable, type Column } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageActions } from "../../components/common/PageActions";
import { TextInput, Select } from "../../components/forms/Fields";
import { useLocalData } from "../../services/useLocalData";
import { toast, errorMessage } from "../../services/toastService";
const fields = z.object({
  name: z.string().trim().min(1, "Name is required"),
  status: z.enum(["active", "inactive"]),
  categoryId: z.string().optional(),
  shortName: z.string().optional(),
});
type Values = z.infer<typeof fields>;
export interface CatalogRow {
  id: string;
  name: string;
  status: "active" | "inactive";
  categoryId?: string;
  shortName?: string;
}
export interface CatalogConfig {
  title: string;
  singular: string;
  list: () => CatalogRow[];
  save: (input: Values & { id?: string }) => unknown;
  remove: (id: string) => void;
  columns?: Column<CatalogRow>[];
  parents?: { id: string; name: string }[];
  shortName?: boolean;
}
function Editor({
  config,
  item,
  done,
}: {
  config: CatalogConfig;
  item?: CatalogRow;
  done: () => void;
}) {
  const schema = fields.superRefine((v, ctx) => {
    if (config.parents && !v.categoryId)
      ctx.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Choose a parent category",
      });
    if (config.shortName && !v.shortName?.trim())
      ctx.addIssue({
        code: "custom",
        path: ["shortName"],
        message: "Short name is required",
      });
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name ?? "",
      status: item?.status ?? "active",
      categoryId: item?.categoryId ?? "",
      shortName: item?.shortName ?? "",
    },
  });
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((v) => {
        try {
          config.save({ ...v, id: item?.id });
          toast.success(`${config.singular} saved`);
          done();
        } catch (e) {
          setError(errorMessage(e));
        }
      })}
    >
      <TextInput
        label="Name"

        {...register("name")}
        error={errors.name?.message}
      />
      {config.parents && (
        <Select
          label="Parent category"
          {...register("categoryId")}
          error={errors.categoryId?.message}
        >
          <option value=""><T text={"Choose category"}/></option>
          {config.parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      )}
      {config.shortName && (
        <TextInput
          label="Short name"
          {...register("shortName")}
          error={errors.shortName?.message}
        />
      )}
      <Select label="Status" {...register("status")}>
        <option value="active"><T text={"Active"}/></option>
        <option value="inactive"><T text={"Inactive"}/></option>
      </Select>
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={done}><T text={"Cancel"}/></button>
        <button disabled={isSubmitting} className="btn-primary"><T text={"Save"}/>{config.singular.toLowerCase()}
        </button>
      </div>
    </form>
  );
}
export function CatalogPage({ config }: { config: CatalogConfig }) {
  useLocalData();
  const [edit, setEdit] = useState<CatalogRow | "new">();
  const [remove, setRemove] = useState<CatalogRow>();
  const [parent, setParent] = useState("");
  const [status,setStatus]=useState('');
  const allRows=config.list();
  const products=productService.list();
  const [selected,setSelected]=useState<string[]>([]);
  const rows = allRows.filter((r) => (!parent || r.categoryId === parent)&&(!status||r.status===status));
  const example=(id:string)=>products.find(p=>config.title==='Brands'?p.brandId===id:config.title==='Subcategories'?p.subcategoryId===id:p.categoryId===id);

  return (
    <ProductWorkspace title={config.title}>
      <div className="product-metrics">{[[Layers,allRows.length,`All ${config.title.toLowerCase()}`],[CheckCircle2,allRows.filter(r=>r.status==='active').length,'Active'],[XCircle,allRows.filter(r=>r.status==='inactive').length,'Inactive'],[Package,products.length,'Catalog products']].map(([Icon,value,label])=>{const Mark=Icon as typeof Layers;return <div className="product-metric" key={String(label)}><span className="rounded-lg bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-500/15"><Mark size={22}/></span><div><strong>{String(value)}</strong><span>{String(label)}</span></div></div>;})}</div>
      <PageActions title={config.title}>
        <Can permission="products:create"><button className="btn-primary" onClick={() => setEdit("new")}>
          <Plus size={16}/><T text={" Add "}/>{config.singular}
        </button></Can>
      </PageActions>
      <div className="product-filters"><Select label="Status" value={status} onChange={e=>setStatus(e.target.value)}><option value=""><T text={"All statuses"}/></option><option value="active"><T text={"Active"}/></option><option value="inactive"><T text={"Inactive"}/></option></Select>{config.parents && (
        <div className="mb-4 max-w-xs">
          <Select
            label="Filter by category"
            value={parent}
            onChange={(e) => setParent(e.target.value)}
          >
            <option value=""><T text={"All categories"}/></option>
            {config.parents.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      </div><section className="card p-0">
        <DataTable
          caption={config.title}
          rows={rows}
          selection={selected}
          onSelectionChange={setSelected}
          rowKey={(r) => r.id}
          searchText={(r) => `${r.name} ${r.shortName ?? ""}`}
          columns={[
            {
              id: "name",
              header: "Name",
              cell: (r) => {const p=example(r.id);return <div className="flex items-center gap-3">{p?<ProductImage imageId={p.imageId} name={p.name}/>:<span className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-slate-50 text-indigo-500 dark:border-slate-700 dark:bg-slate-800"><Layers size={18}/></span>}<strong className="font-semibold">{r.name}</strong></div>;},
              sortValue: (r) => r.name,
            },
            ...(config.columns ?? []),
            {
              id: "status",
              header: "Status",
              cell: (r) => <CatalogStatus status={r.status}/>,
              sortValue: (r) => r.status,
            },
          ]}
          actions={(r) => (
            <Popover label={`Actions for ${r.name}`} trigger={<MoreVertical size={16}/>} className="icon-btn border-transparent"><div className="flex min-w-40 flex-col gap-1 p-2">
              <Can permission="products:edit"><button
                className="flex items-center gap-3 rounded p-2 text-left hover:bg-indigo-50 dark:hover:bg-slate-800"
                onClick={() => setEdit(r)}
                aria-label={`Edit ${r.name}`}
              >
                <Pencil size={16}/><T text={"Edit"}/></button></Can>
              <Can permission="products:delete"><button
                className="flex items-center gap-3 rounded p-2 text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                onClick={() => setRemove(r)}
                aria-label={`Delete ${r.name}`}
              >
                <Trash2 size={16}/><T text={"Delete"}/></button></Can>
            </div></Popover>
          )}
        />
      </section>
      <Modal
        open={!!edit}
        title={`${edit === "new" ? "Add" : "Edit"} ${config.singular}`}
        onClose={() => setEdit(undefined)}
      >
        {edit && (
          <Editor
            config={config}
            item={edit === "new" ? undefined : edit}
            done={() => setEdit(undefined)}
          />
        )}
      </Modal>
      {remove && (
        <ConfirmDialog
          open
          title={`Delete ${remove.name}?`}
          message="This removes the record permanently. Records in use must be deactivated instead."
          onClose={() => setRemove(undefined)}
          onConfirm={() => {
            config.remove(remove.id);
            toast.success(`${config.singular} deleted`);
          }}
        />
      )}
    </ProductWorkspace>
  );
}
