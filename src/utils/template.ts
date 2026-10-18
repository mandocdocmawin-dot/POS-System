export const templateVariables = ['business.name', 'customer.name', 'order.no', 'order.total', 'order.balance', 'order.date', 'purchase.no', 'supplier.name', 'staff.name', 'branch.name'] as const;
export function renderTemplate(text: string, values: Record<string, string>) {
  const unknown = new Set<string>();
  const rendered = text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (match: string, variable: string) => {
    if (!templateVariables.some(key => key === variable) || values[variable] === undefined) { unknown.add(variable); return match; }
    return values[variable];
  });
  return { text: rendered, unknown: [...unknown] };
}
