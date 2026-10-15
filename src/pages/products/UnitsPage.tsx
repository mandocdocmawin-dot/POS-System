import { CatalogPage } from './CatalogPage';
import { unitService } from '../../services/unitService';
import { productService } from '../../services/productService';
export function Component() { return <CatalogPage config={{ title: 'Units', singular: 'Unit', ...unitService, shortName: true, columns: [{ id: 'shortName', header: 'Short name', cell: r => r.shortName, sortValue: r => r.shortName ?? '' }, { id: 'products', header: 'Products', cell: r => productService.list().filter(p => p.unitId === r.id).length }] }} />; }
