import type { Unit } from '../../types/models';
export const units: Unit[] = [['Pieces', 'pcs'], ['Kilogram', 'kg'], ['Pack', 'pack'], ['Box', 'box'], ['Bottle', 'bottle'], ['Liter', 'liter']].map(([name, shortName], i) => ({ id: `unit-${i}`, name, shortName, status: 'active' }));
