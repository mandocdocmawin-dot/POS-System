import {productSchema,type Product} from '../types/models';
import {productService,type ProductInput} from './productService';
import {categoryService,brandService,unitService} from './catalogService';
import {localTransaction} from './localTransaction';
import {requirePermission} from './authService';
import {settingsService} from './settingsService';
export const productImportHeaders=['name','sku','categoryId','unitId','costPrice','sellingPrice','openingStock','brandId'] as const;
export function parseProductCSV(text:string):string[][]{
 if(text.length>1_000_000)throw new Error('Choose a CSV smaller than 1 MB.');
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
 const source=text.replace(/^\uFEFF/,'');
 for(let i=0;i<source.length;i++){
  const c=source[i];
  if(c==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++;}else if(quoted){quoted=false;closed=true;}else if(cell.length||closed)throw new Error('Unexpected quote in CSV.');else quoted=true;}
  else if(c===','&&!quoted){row.push(cell.trim());cell='';closed=false;}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&source[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell='';closed=false;}
  else if(closed){if(c!==' '&&c!=='\t')throw new Error('Unexpected text after a quoted field.');}
  else cell+=c;
 }
 if(quoted)throw new Error('A quoted field is missing its closing quote.');
 row.push(cell.trim());if(row.some(Boolean))rows.push(row);
 if(rows.length>201)throw new Error('Import up to 200 products at a time.');
 return rows;
}
export interface ProductImportRow {id:string;input:ProductInput;openingStock:number;errors:string[]}
export const productImportService={
 preview(text:string):ProductImportRow[]{
  const [headers,...rows]=parseProductCSV(text);
  if(!headers||!rows.length)throw new Error('Include a header and at least one product row.');
  if(new Set(headers).size!==headers.length)throw new Error('CSV headers must be unique.');
  const missing=productImportHeaders.slice(0,7).filter(h=>!headers.includes(h));
  if(missing.length)throw new Error(`Missing columns: ${missing.join(', ')}.`);
  const used=new Set([...productService.list(),...productService.variants()].map(p=>p.sku.toLowerCase()));
  const categories=categoryService.list(),units=unitService.list(),brands=brandService.list();
  const rate=settingsService.get().tax.rates.find(r=>r.isDefault&&r.status==='active');
  return rows.map((cells,index)=>{
   const values=Object.fromEntries(headers.map((h,i)=>[h,cells[i]??'']));
   const errors:string[]=[];
   if(cells.length!==headers.length)errors.push('Column count does not match the header');
   const numeric=(name:string)=>{const raw=values[name];if(!raw?.trim()||!Number.isFinite(Number(raw))||Number(raw)<0){errors.push(`${name} must be a nonnegative number`);return 0;}return Number(raw);};
   const input:ProductInput={name:values.name,sku:values.sku,categoryId:values.categoryId,unitId:values.unitId,brandId:values.brandId||undefined,costPrice:numeric('costPrice'),sellingPrice:numeric('sellingPrice'),taxRate:rate?.rate??12,taxRateId:rate?.id,reorderLevel:settingsService.get().general.lowStockDefaultReorder,hasVariants:false,status:'active'};
   const openingStock=numeric('openingStock');
   if(!input.name||!input.sku)errors.push('Name and SKU are required');
   if(used.has(input.sku.toLowerCase()))errors.push('SKU already exists in the catalog or file');
   used.add(input.sku.toLowerCase());
   if(!categories.some(c=>c.id===input.categoryId))errors.push('Unknown category ID');
   if(!units.some(u=>u.id===input.unitId))errors.push('Unknown unit ID');
   if(input.brandId&&!brands.some(b=>b.id===input.brandId))errors.push('Unknown brand ID');
   const parsed=productSchema.safeParse({...input,id:'preview',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
   if(!parsed.success&&!errors.length)errors.push('Product values are invalid');
   return {id:String(index+2),input,openingStock,errors};
  });
 },
 apply(text:string):Product[]{
  requirePermission('products:create');
  const rows=productImportService.preview(text);
  if(rows.some(r=>r.errors.length))throw new Error('Resolve all row errors before importing.');
  return localTransaction(()=>rows.map(r=>productService.save(r.input,{openingStock:r.openingStock})));
 },
};
