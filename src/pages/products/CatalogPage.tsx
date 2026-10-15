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
        autoFocus
        {...register("name")}
        error={errors.name?.message}
      />
      {config.parents && (
        <Select
          label="Parent category"
          {...register("categoryId")}
          error={errors.categoryId?.message}
        >
          <option value="">Choose category</option>
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
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={done}>
          Cancel
        </button>
        <button disabled={isSubmitting} className="btn-primary">
          Save {config.singular.toLowerCase()}
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
  const rows = config.list().filter((r) => !parent || r.categoryId === parent);
  return (
    <>
      <PageActions title={config.title}>
        <button className="btn-primary" onClick={() => setEdit("new")}>
          Add {config.singular}
        </button>
      </PageActions>
      {config.parents && (
        <div className="mb-4 max-w-xs">
          <Select
            label="Filter by category"
            value={parent}
            onChange={(e) => setParent(e.target.value)}
          >
            <option value="">All categories</option>
            {config.parents.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      <section className="card p-0">
        <DataTable
          caption={config.title}
          rows={rows}
          rowKey={(r) => r.id}
          searchText={(r) => `${r.name} ${r.shortName ?? ""}`}
          columns={[
            {
              id: "name",
              header: "Name",
              cell: (r) => r.name,
              sortValue: (r) => r.name,
            },
            ...(config.columns ?? []),
            {
              id: "status",
              header: "Status",
              cell: (r) => (
                <span
                  className={
                    r.status === "active"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }
                >
                  {r.status}
                </span>
              ),
              sortValue: (r) => r.status,
            },
          ]}
          actions={(r) => (
            <div className="flex gap-3">
              <button
                className="text-indigo-500"
                onClick={() => setEdit(r)}
                aria-label={`Edit ${r.name}`}
              >
                Edit
              </button>
              <button
                className="text-red-500"
                onClick={() => setRemove(r)}
                aria-label={`Delete ${r.name}`}
              >
                Delete
              </button>
            </div>
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
    </>
  );
}
