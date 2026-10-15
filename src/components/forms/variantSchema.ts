import { z } from 'zod';
import { parseAttributes } from '../../utils/attributes';
export const variantFormSchema = z.object({ id:z.string().optional(), name:z.string().trim().min(1,'Variant name is required'),sku:z.string().trim().min(1,'SKU is required'),barcode:z.string().optional(),costPrice:z.number().finite().nonnegative(),sellingPrice:z.number().finite().nonnegative(),openingStock:z.number().finite().nonnegative(),attributesText:z.string().refine(v=>{try{parseAttributes(v);return true;}catch{return false;}},'Use unique attribute: value pairs, separated by commas') });
export type VariantFormValues=z.infer<typeof variantFormSchema>;
