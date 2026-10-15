import { z } from 'zod';
import { categorySchema, subcategorySchema, brandSchema, unitSchema, productSchema, variantSchema, movementSchema } from '../types/models';
export const backupSchema=z.object({version:z.literal(1),categories:z.array(categorySchema),subcategories:z.array(subcategorySchema),brands:z.array(brandSchema),units:z.array(unitSchema),products:z.array(productSchema),variants:z.array(variantSchema),movements:z.array(movementSchema),images:z.record(z.string(),z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/)).optional()}).strict();
export type Backup=z.infer<typeof backupSchema>;
export function validateBackup(input:unknown):Backup {
 const d=backupSchema.parse(input);const fail=(message:string):never=>{throw new Error(`Invalid backup: ${message}`);};
 for(const items of [d.categories,d.subcategories,d.brands,d.units,d.products,d.variants,d.movements])if(new Set(items.map(x=>x.id)).size!==items.length)fail('duplicate record IDs.');
 if(new Set([...d.products,...d.variants].map(x=>x.id)).size!==d.products.length+d.variants.length)fail('product and variant IDs overlap.');
 const skus=[...d.products,...d.variants].map(p=>p.sku.toLowerCase());if(new Set(skus).size!==skus.length)fail('duplicate SKUs.');
 for(const s of d.subcategories)if(!d.categories.some(c=>c.id===s.categoryId))fail('subcategory parent is missing.');
 for(const p of d.products){if(!d.categories.some(c=>c.id===p.categoryId)||!d.units.some(u=>u.id===p.unitId))fail('product category or unit is missing.');if(p.brandId&&!d.brands.some(b=>b.id===p.brandId))fail('product brand is missing.');if(p.subcategoryId&&!d.subcategories.some(s=>s.id===p.subcategoryId&&s.categoryId===p.categoryId))fail('subcategory does not match product category.');if(p.hasVariants!==d.variants.some(v=>v.productId===p.id))fail('variant tracking does not match product.');}
 for(const v of d.variants)if(!d.products.some(p=>p.id===v.productId))fail('variant product is missing.');
 const balances=new Map<string,number>();for(const m of d.movements){const p=d.products.find(p=>p.id===m.productId);if(!p)fail('movement product is missing.');if(p!.hasVariants!==!!m.variantId)fail('movement must match product tracking mode.');if(m.variantId&&!d.variants.some(v=>v.id===m.variantId&&v.productId===m.productId))fail('movement variant is invalid.');const key=m.variantId??m.productId;balances.set(key,(balances.get(key)??0)+(m.type==='out'?-m.quantity:m.quantity));}
 if([...balances.values()].some(v=>v< -1e-8))fail('stock would become negative.');return d;
}
