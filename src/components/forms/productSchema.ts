import { z } from "zod";
import { productSchema } from "../../types/models";
import { variantFormSchema } from "./variantSchema";
export const productFormSchema = productSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    openingStock: z.number().finite().nonnegative(),
    variants: z.array(variantFormSchema),
  })
  .superRefine((v, ctx) => {
    if (v.hasVariants && !v.variants.length)
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Add at least one variant",
      });
  });
export type ProductFormValues = z.infer<typeof productFormSchema>;
