import {products} from '../data/seed/products';
import basket from '../assets/products/all.svg';
const artwork=import.meta.glob('../assets/products/*.webp',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const file=(index:number)=>artwork[`../assets/products/photo-${index}.webp`];
const byName=new Map(products.map((product,index)=>[product.name.toLowerCase(),file(index)]));
/** Reference product photos; uploaded SKU photos always take priority. */
export function productArtwork(name:string){return byName.get(name.trim().toLowerCase());}
export function categoryArtwork(name:string){
 const key=name.toLowerCase();
 if(key==='all')return basket;
 const categories:[RegExp,number][]=[[/rice|grain|noodle/,0],[/canned|tin/,3],[/beverage|drink/,8],[/snack|food/,11],[/personal|beauty/,14],[/household|clean/,19],[/condiment|sauce/,20],[/dairy|egg/,24]];
 const match=categories.find(([pattern])=>pattern.test(key));
 return match?file(match[1]):undefined;
}
