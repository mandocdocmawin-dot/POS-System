import { products, categories } from '../data/products'
// No network or persistence in Phase 1. Return copies so UI cannot mutate source data.
export const productService = { getProducts: () => products.map(product => ({ ...product })), getCategories: () => categories.map(category => ({ ...category })), getBrands: () => [...new Set(products.map(product => product.brand))] }
