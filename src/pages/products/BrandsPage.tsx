import { CatalogPage } from './CatalogPage';
import { brandService } from '../../services/brandService';
import { productService } from '../../services/productService';
export function Component() { return <CatalogPage config={{ title: 'Brands', singular: 'Brand', ...brandService, columns: [{ id: 'products', header: 'Products', cell: r => productService.list().filter(p => p.brandId === r.id).length }] }} />; }
