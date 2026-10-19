import { T } from "../../i18n/T";
import {InventoryWorkspace} from '../../components/inventory/InventoryWorkspace';
import {Modal} from '../../components/common/Modal';
import {Plus} from 'lucide-react';
import {branchService} from '../../services/branchService';
import { localDate } from "../../utils/date";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  NumberInput,
  Select,
  TextInput,
  Textarea,
} from "../../components/forms/Fields";
import { PageActions } from "../../components/common/PageActions";
import { stockService } from "../../services/stockService";
import { useLocalData } from "../../services/useLocalData";
import { toast, errorMessage } from "../../services/toastService";
import { MovementHistory } from "./MovementHistory";
const inReasons = ["Purchase", "Customer Return", "Found", "Other"];
const outReasons = ["Damaged", "Expired", "Internal Use", "Sample", "Other"];
const schema = z.object({
  item: z.string().min(1, "Choose a product or variant"),
  quantity: z.number().finite().positive("Quantity must be positive"),
  reason: z.string().min(1, "Choose a reason"),
  reference: z.string(),
  note: z.string(),
  date: z.iso.date(),
});
type Values = z.infer<typeof schema>;
export function StockMovementPage({ type }: { type: "in" | "out" }) {
  const reasons = type === "in" ? inReasons : outReasons;
  useLocalData();
  const [error, setError] = useState("");
  const [create,setCreate]=useState(false);
  const items = stockService.items(branchService.activeId());
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      item: "",
      quantity: 1,
      reason: "",
      reference: "",
      note: "",
      date: localDate(),
    },
  });
  const key = useWatch({ control, name: "item" });
  const item = items.find((i) => i.key === key);
  return (
    <InventoryWorkspace title={type === "in" ? "Stock In" : "Stock Out"}>
      <p className="mb-4 rounded-lg border border-indigo-200 p-3 text-sm dark:border-indigo-800"><T text={"Active branch: "}/><strong>{branchService.get(branchService.activeId())?.name}</strong></p>
      <PageActions title={type === "in" ? "Stock In" : "Stock Out"}><button className="btn-primary" onClick={()=>setCreate(true)}><Plus size={16}/><T text={" Add "}/>{type === "in" ? "Stock In" : "Stock Out"}</button></PageActions>
      <Modal open={create} onClose={()=>setCreate(false)} title={type === "in" ? "Stock In" : "Stock Out"}><form
        className="card mb-6 space-y-4"
        onSubmit={handleSubmit((v) => {
          try {
            const selected = stockService.items(branchService.activeId()).find((i) => i.key === v.item);
            if (!selected) throw new Error("Choose an existing item");
            if (!reasons.includes(v.reason))
              throw new Error("Choose a valid reason");
            stockService.record({branchId:branchService.activeId(),
              productId: selected.product.id,
              variantId: selected.variant?.id,
              type,
              quantity: v.quantity,
              reason: v.reason,
              reference: v.reference,
              note: v.note,
              createdAt: new Date(`${v.date}T12:00:00`).toISOString(),
            });
            toast.success(type === "in" ? "Stock received" : "Stock removed");
            reset({ ...v, quantity: 1, reference: "", note: "" });
            setError("");
          } catch (e) {
            setError(errorMessage(e));
          }
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Product / variant"
            {...register("item")}
            error={errors.item?.message}
          >
            <option value=""><T text={"Choose item"}/></option>
            {items.map((i) => (
              <option key={i.key} value={i.key}>
                {i.name} · {i.sku}
              </option>
            ))}
          </Select>
          <NumberInput
            label="Quantity"
            max={type === "out" ? item?.stock : undefined}
            min="0.00000001"
            {...register("quantity", { valueAsNumber: true })}
            error={errors.quantity?.message}
          />
          <Select
            label="Reason"
            {...register("reason")}
            error={errors.reason?.message}
          >
            <option value=""><T text={"Choose reason"}/></option>
            {reasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
          <TextInput label="Reference number" {...register("reference")} />
          <TextInput
            label="Date"
            type="date"
            {...register("date")}
            error={errors.date?.message}
          />
        </div>
        {item && (
          <p><T text={"Current stock:"}/><strong>{item.stock}</strong>
          </p>
        )}
        <Textarea label="Note" {...register("note")} />
        {error && (
          <p role="alert" className="text-red-500">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <button className="btn-primary" disabled={isSubmitting}>
            {type === "in" ? "Record stock in" : "Record stock out"}
          </button>
        </div>
      </form></Modal>
      <MovementHistory type={type} />
    </InventoryWorkspace>
  );
}
export function Component() {
  return <StockMovementPage type="in" />;
}
