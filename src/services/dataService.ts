import { categories, subcategories } from '../data/seed/categories';
import { brands } from '../data/seed/brands';
import { units } from '../data/seed/units';
import { products, variants } from '../data/seed/products';
import { movements } from '../data/seed/movements';
import { useCatalogStore } from '../store/useCatalogStore';
import { useProductStore } from '../store/useProductStore';
import { useStockStore } from '../store/useStockStore';
export const dataService = {
  reset: () => { useCatalogStore.setState(structuredClone({ categories, subcategories, brands, units }), true); useProductStore.setState(structuredClone({ products, variants }), true); useStockStore.setState(structuredClone({ movements }), true); },
  initialize: () => { if (['catalog','products','stock'].every(key => localStorage.getItem(`tindapos:${key}`) === null)) dataService.reset(); },
};
