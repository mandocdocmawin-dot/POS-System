import {useCustomerStore} from '../store/useCustomerStore';
import {useOrderStore} from '../store/useOrderStore';
import {useHeldOrderStore} from '../store/useHeldOrderStore';
import {usePosStore} from '../store/usePosStore';
import {createPosSeed} from '../data/seed/pos';
import {WALK_IN_ID} from '../config/pos';
import {formatOrderNo} from '../utils/orderNo';
import { localTransaction } from "./localTransaction";
import { validateBackup, type Backup } from "./backupSchema";
import { imageService } from "./imageService";
import { categories, subcategories } from "../data/seed/categories";
import { brands } from "../data/seed/brands";
import { units } from "../data/seed/units";
import { products, variants } from "../data/seed/products";
import { movements } from "../data/seed/movements";
import { useCatalogStore } from "../store/useCatalogStore";
import { useProductStore } from "../store/useProductStore";
import { useStockStore } from "../store/useStockStore";
function snapshot(): Backup {
  return {
    version: 1,
    ...structuredClone(useCustomerStore.getState()),
    ...structuredClone(useOrderStore.getState()),
    ...structuredClone(useHeldOrderStore.getState()),
    pos:structuredClone(usePosStore.getState()),
    ...structuredClone(useCatalogStore.getState()),
    ...structuredClone(useProductStore.getState()),
    ...structuredClone(useStockStore.getState()),
  };
}
function replace(data: Backup) {
  localTransaction(() => {
    useCatalogStore.setState(
      {
        categories: data.categories,
        subcategories: data.subcategories,
        brands: data.brands,
        units: data.units,
      },
      true,
    );
    useProductStore.setState(
      { products: data.products, variants: data.variants },
      true,
    );
    useStockStore.setState({ movements: data.movements }, true);
    useCustomerStore.setState({customers:data.customers},true);
    useOrderStore.setState({orders:data.orders,counter:data.counter},true);
    useHeldOrderStore.setState({heldOrders:data.heldOrders},true);
    usePosStore.setState(data.pos,true);
  });
}
export const dataService = {
  export: async () => {
    const data = snapshot();
    const imageRefs=[...data.products,...data.pos.cart,...data.heldOrders.flatMap(h=>h.cart),...data.orders.flatMap(o=>o.items)];
    const all = imageRefs.some((p) => p.imageId)
      ? await imageService.export()
      : {};
    return JSON.stringify(
      {
        ...data,
        images: Object.fromEntries(
          Object.entries(all).filter(([id]) =>
            imageRefs.some((p) => p.imageId === id),
          ),
        ),
      },
      null,
      2,
    );
  },
  validate: (text: string) => validateBackup(JSON.parse(text)),
  import: async (text: string) => {
    const data = validateBackup(JSON.parse(text));
    const images: [string, Blob][] = [];
    for (const [id, value] of Object.entries(data.images ?? {})) {
      if (value.length > 3000000)
        throw new Error("Imported image is too large.");
      const bytes = Uint8Array.from(atob(value.split(",")[1]), (c) =>
        c.charCodeAt(0),
      );
      const blob = new Blob([bytes], { type: "image/jpeg" });
      const bitmap = await createImageBitmap(blob);
      const valid = bitmap.width <= 800 && bitmap.height <= 800;
      bitmap.close();
      if (!valid) throw new Error("Imported images must be at most 800px.");
      images.push([id, blob]);
    }
    const mapped: [string, Blob][] = [];
    for (const [id, blob] of images) {
      const freshId = crypto.randomUUID();
      [...data.products,...data.pos.cart,...data.heldOrders.flatMap(h=>h.cart),...data.orders.flatMap(o=>o.items)].forEach((p) => {
        if (p.imageId === id) p.imageId = freshId;
      });
      mapped.push([freshId, blob]);
    }
    if (mapped.length) await imageService.import(mapped);
    try {
      replace(data);
    } catch (e) {
      await Promise.all(mapped.map(([id]) => imageService.remove(id)));
      throw e;
    }
  },
  reset: () => {
    const seed=createPosSeed();
    replace(structuredClone({version:1,categories,subcategories,brands,units,products,variants,movements:[...movements,...seed.movements],customers:seed.customers,orders:seed.orders,counter:seed.counter,heldOrders:[],pos:{cart:[],customerId:WALK_IN_ID,orderDiscount:{type:'fixed',value:0},note:'',activeOrderNo:formatOrderNo(seed.counter+1)}}));
  },
  initialize: () => {
    if (
      ["catalog", "products", "stock"].every(
        (key) => localStorage.getItem(`tindapos:${key}`) === null,
      )
    )
      dataService.reset();
  },
};
